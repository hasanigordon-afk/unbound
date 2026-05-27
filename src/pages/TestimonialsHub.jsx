import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import PilotShell from '@/components/pilot/PilotShell';
import InspirationRow from '@/components/inspiration/InspirationRow';
import VideoPlayerModal from '@/components/inspiration/VideoPlayerModal';
import ReadingModal from '@/components/inspiration/ReadingModal';
import { Search, Send, Sparkles } from 'lucide-react';
import { pilotAhHaMoments, pilotReadings, pilotVideos } from '@/lib/pilotSeedData';

const tabs = ['Ah Ha Moments', 'Watch', 'Read', 'Saved Inspiration'];
const filters = ['Watch', 'Read', 'Ah Ha Moments', 'Help', 'Hope', 'Healing', 'Early Recovery', 'Long-Term Recovery', 'Reentry', 'Veterans', 'Family', 'Mental Strength'];
const reactionTypes = ['Inspired', 'Respect', 'Powerful', 'Needed This', 'Proud Of You'];

export default function TestimonialsHub() {
  const [activeTab, setActiveTab] = useState('Ah Ha Moments');
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState([]);
  const [readings, setReadings] = useState([]);
  const [stories, setStories] = useState([]);
  const [storyReactions, setStoryReactions] = useState([]);
  const [savedMedia, setSavedMedia] = useState([]);
  const [savedReading, setSavedReading] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedReading, setSelectedReading] = useState(null);
  const [storyText, setStoryText] = useState('');
  const [storyTitle, setStoryTitle] = useState('');

  const loadStoryReactions = async () => {
    const rows = await base44.entities.AhHaStoryReaction.list('-created_date', 300);
    setStoryReactions(rows);
  };

  const load = async () => {
    const [mediaRows, readingRows, storyRows, savedMediaRows, savedReadingRows, reactionRows] = await Promise.all([
      base44.entities.MediaItem.filter({ moderation_status: 'approved', is_positive_content: true }, '-updated_date', 100),
      base44.entities.ReadingItem.filter({ moderation_status: 'approved', is_positive_content: true }, '-updated_date', 100),
      base44.entities.AhHaInspirationStory.filter({ moderation_status: 'approved', is_positive_content: true }, '-updated_date', 50),
      base44.entities.SavedMedia.list('-created_date', 100),
      base44.entities.SavedReading.list('-created_date', 100),
      base44.entities.AhHaStoryReaction.list('-created_date', 300),
    ]);
    const approvedVideos = mediaRows.filter((item) => item.media_type === 'video');
    setVideos(approvedVideos.length ? approvedVideos : pilotVideos);
    setReadings(readingRows.length ? readingRows : pilotReadings);
    setStories(storyRows.length ? storyRows : pilotAhHaMoments);
    setSavedMedia(savedMediaRows);
    setSavedReading(savedReadingRows);
    setStoryReactions(reactionRows);
  };

  useEffect(() => {
    load();
    const unsubscribe = base44.entities.AhHaStoryReaction.subscribe(loadStoryReactions);
    return unsubscribe;
  }, []);

  const searchText = query.toLowerCase();
  const filteredVideos = useMemo(() => videos.filter((item) => `${item.title} ${item.description} ${item.category} ${item.tags?.join(' ')}`.toLowerCase().includes(searchText)), [videos, searchText]);
  const filteredReadings = useMemo(() => readings.filter((item) => `${item.title} ${item.summary} ${item.category} ${item.tags?.join(' ')}`.toLowerCase().includes(searchText)), [readings, searchText]);
  const relatedVideos = selectedVideo ? videos.filter((item) => item.id !== selectedVideo.id && item.category === selectedVideo.category).slice(0, 4) : [];
  const relatedReadings = selectedReading ? readings.filter((item) => item.id !== selectedReading.id && item.category === selectedReading.category).slice(0, 4) : [];

  const saveVideo = async (item) => { await base44.entities.SavedMedia.create({ media_id: item.id, saved_at: new Date().toISOString() }); await load(); };
  const saveReading = async (item) => { await base44.entities.SavedReading.create({ reading_id: item.id, saved_at: new Date().toISOString() }); await load(); };
  const report = async (item, type) => { await base44.entities.InspirationReport.create({ content_type: type, content_id: item.id, reason: 'User reported content' }); alert('Thanks. This content was sent for review.'); };
  const share = async (item) => {
    const url = item.source_url || window.location.href;
    if (navigator.share) await navigator.share({ title: item.title, text: item.summary || item.description, url });
    else { await navigator.clipboard.writeText(url); alert('Link copied'); }
  };
  const helpfulVideo = async (item) => base44.entities.MediaItem.update(item.id, { helpful_count: (item.helpful_count || 0) + 1 });
  const helpfulReading = async (item) => base44.entities.ReadingItem.update(item.id, { helpful_count: (item.helpful_count || 0) + 1 });
  const submitStory = async () => {
    if (!storyTitle || !storyText) return;
    await base44.entities.AhHaInspirationStory.create({ title: storyTitle, story: storyText, category: 'Hope', moderation_status: 'pending_review', privacy: 'anonymous', is_positive_content: true });
    setStoryTitle(''); setStoryText(''); alert('Your Ah Ha Moment was submitted for review.');
  };

  const reactToStory = async (story, reactionType) => {
    await base44.entities.AhHaStoryReaction.create({ story_id: story.id, reaction_type: reactionType });
  };

  const getStoryReactionCount = (storyId, reactionType) => storyReactions.filter((reaction) => reaction.story_id === storyId && reaction.reaction_type === reactionType).length;

  const savedVideoItems = videos.filter((v) => savedMedia.some((s) => s.media_id === v.id));
  const savedReadingItems = readings.filter((r) => savedReading.some((s) => s.reading_id === r.id));
  const rowItems = (items, fallback = []) => items.length ? items : fallback.length ? fallback : videos.slice(0, 4);

  return (
    <PilotShell title="Ah Ha Moments" subtitle="Community insight and positive recovery inspiration: Help. Hope. Healing.">
      <div className="space-y-6">
        <div className="rounded-[36px] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-200">Moderated. Supportive. Non-toxic.</p>
          <h1 className="mt-2 font-sans text-4xl font-black text-white">Ah Ha Moments for hard days</h1>
          <p className="mt-3 text-sm font-bold leading-relaxed text-slate-300">Text, audio, video, anonymous, public, and private moments can be submitted for moderation. Reactions stay supportive.</p>
          <div className="mt-5 flex items-center gap-2 rounded-3xl border border-white/10 bg-white/10 px-4 py-2">
            <Search className="h-4 w-4 text-slate-300" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search hope, reentry, sober motivation..." className="w-full border-0 bg-transparent p-2 text-sm" />
          </div>
        </div>

        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">{tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`min-h-0 whitespace-nowrap rounded-full px-4 py-3 text-xs font-black ${activeTab === tab ? 'bg-white text-slate-950' : 'border border-white/10 bg-white/10 text-white'}`}>{tab}</button>)}</div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">{filters.map((filter) => <span key={filter} className="whitespace-nowrap rounded-full border border-white/10 bg-white/8 px-3 py-2 text-[11px] font-black text-slate-300">{filter}</span>)}</div>

        {(activeTab === 'Ah Ha Moments' || activeTab === 'Watch') && <>
          <InspirationRow title="Featured Today" items={rowItems(filteredVideos.filter((v) => v.is_featured).slice(0, 8), pilotVideos)} type="video" emptyText="Featured ReZilient guidance is loading." onOpen={setSelectedVideo} onSave={saveVideo} onShare={share} onReport={(item) => report(item, 'video')} />
          <InspirationRow title="Watch: Recovery Guidance" items={rowItems(filteredVideos.filter((v) => /recovery|grounding|craving/i.test(v.category || v.title || v.description)).slice(0, 12), pilotVideos)} type="video" emptyText="Recovery guidance is loading." onOpen={setSelectedVideo} onSave={saveVideo} onShare={share} onReport={(item) => report(item, 'video')} />
          <InspirationRow title="Watch: Second Chances" items={rowItems(filteredVideos.filter((v) => /second|reentry|chance/i.test(`${v.title} ${v.description} ${v.category}`)).slice(0, 12), pilotVideos)} type="video" emptyText="Second-chance guidance is loading." onOpen={setSelectedVideo} onSave={saveVideo} onShare={share} onReport={(item) => report(item, 'video')} />
          <InspirationRow title="Watch: Sober Motivation" items={rowItems(filteredVideos.filter((v) => /sober|motivation|hope|craving/i.test(`${v.title} ${v.description}`)).slice(0, 12), pilotVideos)} type="video" emptyText="Sober motivation is loading." onOpen={setSelectedVideo} onSave={saveVideo} onShare={share} onReport={(item) => report(item, 'video')} />
        </>}

        {(activeTab === 'Ah Ha Moments' || activeTab === 'Read') && <>
          <InspirationRow title="Read: Hope & Healing" items={rowItems(filteredReadings.filter((r) => /hope|healing|recovery/i.test(`${r.title} ${r.category}`)).slice(0, 12), pilotReadings)} type="reading" emptyText="Hope and healing reads are loading." onOpen={setSelectedReading} onSave={saveReading} onShare={share} onReport={(item) => report(item, 'reading')} />
          <InspirationRow title="Read: Rebuilding Life" items={rowItems(filteredReadings.filter((r) => /rebuild|life|purpose|career|support/i.test(`${r.title} ${r.summary} ${r.category}`)).slice(0, 12), pilotReadings)} type="reading" emptyText="Life rebuilding reads are loading." onOpen={setSelectedReading} onSave={saveReading} onShare={share} onReport={(item) => report(item, 'reading')} />
          <InspirationRow title="Read: 5-Minute Motivation" items={rowItems(filteredReadings.filter((r) => (r.reading_time_minutes || 5) <= 5).slice(0, 12), pilotReadings)} type="reading" emptyText="Five-minute motivation is loading." onOpen={setSelectedReading} onSave={saveReading} onShare={share} onReport={(item) => report(item, 'reading')} />
        </>}

        {activeTab === 'Ah Ha Moments' && <section className="space-y-4 rounded-[34px] border border-white/12 bg-white/10 p-5">
          <div className="flex items-center gap-3"><Sparkles className="h-6 w-6 text-amber-200" /><h2 className="font-sans text-2xl font-black text-white">Ah Ha Moments From the Community</h2></div>
          <div className="grid gap-3">
            {(stories.length ? stories : pilotAhHaMoments).map((story) => (
              <article key={story.id} className="rounded-3xl border border-white/10 bg-white/10 p-4">
                <h3 className="font-bold text-white">{story.title}</h3>
                <p className="mt-2 text-sm font-bold text-slate-300">{story.story}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-100">{story.category}</span>
                  {reactionTypes.map((reactionType) => (
                    <button key={reactionType} onClick={() => reactToStory(story, reactionType)} className="inline-flex min-h-0 items-center gap-1 rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-2 text-xs font-black text-amber-100 active:scale-95">
                      {reactionType} {getStoryReactionCount(story.id, reactionType)}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4"><h3 className="font-sans text-xl font-black text-white">Submit your Ah Ha Moment</h3><input value={storyTitle} onChange={(e) => setStoryTitle(e.target.value)} placeholder="Moment title" className="mt-3 w-full" /><textarea value={storyText} onChange={(e) => setStoryText(e.target.value)} placeholder="Share a hopeful moment, lesson, or win..." className="mt-3 min-h-[120px] w-full" /><button onClick={submitStory} className="btn-primary mt-3 inline-flex items-center gap-2"><Send className="h-4 w-4" /> Submit for review</button></div>
        </section>}

        {activeTab === 'Saved Inspiration' && <>
          <InspirationRow title="Saved Videos" items={savedVideoItems.length ? savedVideoItems : pilotVideos} type="video" emptyText="Recommended videos are ready to save." onOpen={setSelectedVideo} onSave={saveVideo} onShare={share} onReport={(item) => report(item, 'video')} />
          <InspirationRow title="Saved Reads" items={savedReadingItems.length ? savedReadingItems : pilotReadings} type="reading" emptyText="Recommended reads are ready to save." onOpen={setSelectedReading} onSave={saveReading} onShare={share} onReport={(item) => report(item, 'reading')} />
        </>}
      </div>
      <VideoPlayerModal video={selectedVideo} related={relatedVideos} onClose={() => setSelectedVideo(null)} onSave={saveVideo} onHelpful={helpfulVideo} onOpenRelated={setSelectedVideo} />
      <ReadingModal reading={selectedReading} related={relatedReadings} onClose={() => setSelectedReading(null)} onSave={saveReading} onHelpful={helpfulReading} onOpenRelated={setSelectedReading} />
    </PilotShell>
  );
}