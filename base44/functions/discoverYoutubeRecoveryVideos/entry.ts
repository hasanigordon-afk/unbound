import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SAFE_QUERIES = [
  'recovery story addiction hope', 'sobriety story transformation', 'inspirational recovery story',
  'addiction recovery success story', 'life after addiction recovery story', 'sober motivation',
  'recovery is possible story', 'second chance recovery story', 'mental health recovery story hope',
  'reentry success story', 'veteran recovery story hope', 'overcoming addiction inspirational story',
  'AA recovery speaker hope', 'NA recovery speaker hope', 'sober living success story'
];

const blocked = ['overdose footage', 'graphic', 'using drugs', 'fight', 'crime scene', 'miracle cure', 'conspiracy'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!apiKey) return Response.json({ configured: false, message: 'YouTube search is not configured. Add YOUTUBE_API_KEY to enable video discovery.', videos: [] });

    const body = await req.json().catch(() => ({}));
    const query = SAFE_QUERIES.includes(body.query) ? body.query : SAFE_QUERIES[0];
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('key', apiKey);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('q', query);
    url.searchParams.set('type', 'video');
    url.searchParams.set('safeSearch', 'strict');
    url.searchParams.set('videoEmbeddable', 'true');
    url.searchParams.set('maxResults', String(Math.min(body.maxResults || 8, 12)));

    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) return Response.json({ configured: true, error: data.error?.message || 'YouTube request failed' }, { status: 400 });

    const videos = (data.items || []).filter((item) => {
      const text = `${item.snippet?.title || ''} ${item.snippet?.description || ''}`.toLowerCase();
      return !blocked.some((word) => text.includes(word));
    }).map((item) => ({
      title: item.snippet.title,
      description: item.snippet.description,
      media_type: 'video',
      category: 'Recovery Stories',
      source_name: 'YouTube',
      source_url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      youtube_video_id: item.id.videoId,
      thumbnail_url: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
      channel_name: item.snippet.channelTitle,
      tags: ['recovery', 'hope', 'motivation'],
      tone: 'motivational',
      recovery_stage: 'general',
      moderation_status: 'pending_review',
      is_featured: false,
      is_positive_content: true
    }));

    return Response.json({ configured: true, query, videos });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});