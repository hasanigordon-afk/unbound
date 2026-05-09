import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const HARD_REJECT_TERMS = [
  "how to score","drug deal","trap house","plug","drug tutorial",
  "best high","how to use","snort","shoot up",
  "glorify","glorifying drugs","still using","fentanyl high",
  "kill yourself","suicide method","how to die"
];

const CATEGORY_KEYWORDS = {
  recovery_stories: ["addiction recovery testimony", "sober journey story", "long term sobriety story"],
  celebrity_comebacks: [
    "celebrity comeback story interview",
    "celebrity overcame addiction interview",
    "celebrity addiction recovery interview",
    "celebrity sobriety story",
    "famous athlete addiction recovery",
    "musician sobriety interview",
    "actor overcame addiction story",
  ],
  veteran_motivation: ["veteran transition story", "veteran ptsd recovery", "veteran motivational speech"],
  reentry_success: ["reentry success story", "ex felon rebuilt life", "second chance story"],
  never_give_up: ["never give up motivational", "powerful motivational speech"],
  mental_health_wins: ["depression recovery story", "anxiety recovery testimony", "trauma healing journey"],
  rock_bottom_to_rebuild: ["rock bottom turnaround story", "homeless to success story"],
  faith_hope: ["faith testimony recovery", "redemption story hope"],
  fitness_comebacks: ["fitness transformation story", "addiction to fitness story"],
  everyday_heroes: ["ordinary people inspiring story", "everyday hero story"],
};

function extractYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/) || url.match(/^([A-Za-z0-9_-]{11})$/);
  return m ? m[1] : null;
}

function hasHardRejectTerm(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return HARD_REJECT_TERMS.some(t => lower.includes(t));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { category, keyword, max = 6 } = await req.json();
    if (!category) return Response.json({ error: 'category is required' }, { status: 400 });

    const keywords = keyword ? [keyword] : (CATEGORY_KEYWORDS[category] || []);
    const searchKeyword = keywords[Math.floor(Math.random() * keywords.length)] || category;

    const run = await base44.asServiceRole.entities.ComebackCuratorRun.create({
      category,
      keyword: searchKeyword,
      status: 'running',
      triggered_by: user.email,
    });

    const llmRes = await base44.integrations.Core.InvokeLLM({
      prompt: `You are the Comeback Curator for a recovery & rebuilding app called Re-siliant.

Find ${max} REAL, currently-available YouTube videos matching this search: "${searchKeyword}".

The videos must be:
- Positive, motivational, recovery-safe
- Honest stories of overcoming addiction, hardship, incarceration, mental health, trauma, or rebuilding life
- Focused on comeback, healing, resilience, hope

REJECT and DO NOT include any video that:
- Glorifies drug use, crime, violence, or relapse
- Promotes hopelessness, self-harm, or suicide
- Contains drug tutorials or "how to use" content
- Is graphic or triggering without redemptive arc

For each video give: actual YouTube watch URL, title, channel name, 2-3 sentence summary of why it fits "${category}", a one-line inspirational takeaway, safety score 0-100, and any caution flags.

Only return videos you are confident exist on YouTube right now.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          videos: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                youtube_url: { type: 'string' },
                title: { type: 'string' },
                channel_name: { type: 'string' },
                summary: { type: 'string' },
                takeaway: { type: 'string' },
                safety_score: { type: 'number' },
                safety_flags: { type: 'array', items: { type: 'string' } },
              },
              required: ['youtube_url', 'title', 'summary', 'takeaway'],
            },
          },
        },
        required: ['videos'],
      },
    });

    const videos = (llmRes?.videos || []);
    let saved = 0, rejected = 0;

    for (const v of videos) {
      const yid = extractYouTubeId(v.youtube_url);
      if (!yid) { rejected++; continue; }

      const combined = `${v.title || ''} ${v.summary || ''} ${v.takeaway || ''}`;
      if (hasHardRejectTerm(combined) || (v.safety_score ?? 0) < 60) {
        rejected++;
        continue;
      }

      const existing = await base44.asServiceRole.entities.ComebackVideo.filter({ youtube_id: yid });
      if (existing.length > 0) { rejected++; continue; }

      await base44.asServiceRole.entities.ComebackVideo.create({
        youtube_id: yid,
        youtube_url: `https://www.youtube.com/watch?v=${yid}`,
        embed_url: `https://www.youtube.com/embed/${yid}`,
        title: v.title,
        channel_name: v.channel_name || '',
        thumbnail_url: `https://img.youtube.com/vi/${yid}/hqdefault.jpg`,
        category,
        ai_summary: v.summary,
        ai_takeaway: v.takeaway,
        ai_safety_score: v.safety_score ?? 75,
        ai_safety_flags: v.safety_flags || [],
        review_status: 'pending',
        source_keyword: searchKeyword,
      });
      saved++;
    }

    await base44.asServiceRole.entities.ComebackCuratorRun.update(run.id, {
      videos_found: videos.length,
      videos_saved: saved,
      videos_rejected: rejected,
      status: 'success',
    });

    return Response.json({ success: true, run_id: run.id, keyword: searchKeyword, found: videos.length, saved, rejected });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});