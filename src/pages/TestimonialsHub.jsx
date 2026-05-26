import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import PilotShell from '@/components/pilot/PilotShell';
import InspirationRow from '@/components/inspiration/InspirationRow';
import VideoPlayerModal from '@/components/inspiration/VideoPlayerModal';
import ReadingModal from '@/components/inspiration/ReadingModal';
import { Heart, HeartHandshake, Search, Send, Sparkles } from 'lucide-react';

const tabs = ['Testimonials', 'Watch', 'Read', 'AhHa Stories', 'Saved Inspiration'];
const filters = ['Watch', 'Read', 'User Stories', 'Help', 'Hope', 'Healing', 'Early Recovery', 'Long-Term Recovery', 'Reentry', 'Veterans', 'Family', 'Mental Strength'];

export default function TestimonialsHub() {
  const [activeTab, setActiveTab] = useState('Testimonials');
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
    setVideos(mediaRows.filter((item) => item.media_type === 'video'));
    setReadings(readingRows);
    setStories(storyRows);
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
    setStoryTitle(''); setStoryText(''); alert('Your AhHa Story was submitted for review.');
  };

  const reactToStory = async (story, reactionType) => {
    await base44.entities.AhHaStoryReaction.create({ story_id: story.id, reaction_type: reactionType });
  };

  const getStoryReactionCount = (storyId, reactionType) => storyReactions.filter((reaction) => reaction.story_id === storyId && reaction.reaction_type === reactionType).length;

  const savedVideoItems = videos.filter((v) => savedMedia.some((s) => s.media_id === v.id));
  const savedReadingItems = readings.filter((r) => savedReading.some((s) => s.reading_id === r.id));

  return (
    <PilotShell title="Testimonials" subtitle="Positive recovery inspiration: Help. Hope. Healing.">
      <div className="space-y-6">
        <div className="rounded-[36px] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-200">Positive stories only</p>
          <h1 className="mt-2 font-sans text-4xl font-black text-white">Recovery inspiration for hard days</h1>
          <p className="mt-3 text-sm font-bold leading-relaxed text-slate-300">Watch hopeful recovery videos, read uplifting stories, save what helps, and share your own AhHa moment after moderation.</p>
          <div className="mt-5 flex items-center gap-2 rounded-3xl border border-white/10 bg-white/10 px-4 py-2">
            <Search className="h-4 w-4 text-slate-300" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search hope, reentry, sober motivation..." className="w-full border-0 bg-transparent p-2 text-sm" />
          </div>
        </div>

        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">{tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`min-h-0 whitespace-nowrap rounded-full px-4 py-3 text-xs font-black ${activeTab === tab ? 'bg-white text-slate-950' : 'border border-white/10 bg-white/10 text-white'}`}>{tab}</button>)}</div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">{filters.map((filter) => <span key={filter} className="whitespace-nowrap rounded-full border border-white/10 bg-white/8 px-3 py-2 text-[11px] font-black text-slate-300">{filter}</span>)}</div>

        {(activeTab === 'Testimonials' || activeTab === 'Watch') && <>
          <InspirationRow title="Featured Today" items={filteredVideos.filter((v) => v.is_featured).slice(0, 8)} type="video" emptyText="No featured recovery videos yet. Approve videos from the admin panel." onOpen={setSelectedVideo} onSave={saveVideo} onShare={share} onReport={(item) => report(item, 'video')} />
          <InspirationRow title="Watch: Recovery Stories" items={filteredVideos.filter((v) => /recovery|story/i.test(v.category || v.title)).slice(0, 12)} type="video" emptyText="No approved recovery videos yet. Add a YouTube API key or approve videos from the admin panel." onOpen={setSelectedVideo} onSave={saveVideo} onShare={share} onReport={(item) => report(item, 'video')} />
          <InspirationRow title="Watch: Second Chances" items={filteredVideos.filter((v) => /second|reentry|chance/i.test(`${v.title} ${v.description} ${v.category}`)).slice(0, 12)} type="video" emptyText="No approved second chance videos yet." onOpen={setSelectedVideo} onSave={saveVideo} onShare={share} onReport={(item) => report(item, 'video')} />
          <InspirationRow title="Watch: Sober Motivation" items={filteredVideos.filter((v) => /sober|motivation|hope/i.test(`${v.title} ${v.description}`)).slice(0, 12)} type="video" emptyText="No approved sober motivation videos yet." onOpen={setSelectedVideo} onSave={saveVideo} onShare={share} onReport={(item) => report(item, 'video')} />
        </>}

        {(activeTab === 'Testimonials' || activeTab === 'Read') && <>
          <InspirationRow title="Read: Hope & Healing" items={filteredReadings.filter((r) => /hope|healing|recovery/i.test(`${r.title} ${r.category}`)).slice(0, 12)} type="reading" emptyText="No approved reading material yet. Add positive recovery readings from the admin panel." onOpen={setSelectedReading} onSave={saveReading} onShare={share} onReport={(item) => report(item, 'reading')} />
          <InspirationRow title="Read: Rebuilding Life" items={filteredReadings.filter((r) => /rebuild|life|purpose|career/i.test(`${r.title} ${r.summary} ${r.category}`)).slice(0, 12)} type="reading" emptyText="No approved rebuilding life readings yet." onOpen={setSelectedReading} onSave={saveReading} onShare={share} onReport={(item) => report(item, 'reading')} />
          <InspirationRow title="Read: 5-Minute Motivation" items={filteredReadings.filter((r) => (r.reading_time_minutes || 5) <= 5).slice(0, 12)} type="reading" emptyText="No approved 5-minute reads yet." onOpen={setSelectedReading} onSave={saveReading} onShare={share} onReport={(item) => report(item, 'reading')} />
        </>}

        {activeTab === 'AhHa Stories' && <section className="space-y-4 rounded-[34px] border border-white/12 bg-white/10 p-5">
          <div className="flex items-center gap-3"><Sparkles className="h-6 w-6 text-amber-200" /><h2 className="font-sans text-2xl font-black text-white">AhHa Moments From the Community</h2></div>
          <div className="grid gap-3">
            {stories.length ? stories.map((story) => (
              <article key={story.id} className="rounded-3xl border border-white/10 bg-white/10 p-4">
                <h3 className="font-bold text-white">{story.title}</h3>
                <p className="mt-2 text-sm font-bold text-slate-300">{story.story}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-100">{story.category}</span>
                  <button onClick={() => reactToStory(story, 'heart')} className="inline-flex min-h-0 items-center gap-1 rounded-full border border-rose-300/20 bg-rose-400/10 px-3 py-2 text-xs font-black text-rose-100 active:scale-95">
                    <Heart className="h-4 w-4" /> {getStoryReactionCount(story.id, 'heart')}
                  </button>
                  <button onClick={() => reactToStory(story, 'support')} className="inline-flex min-h-0 items-center gap-1 rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-2 text-xs font-black text-blue-100 active:scale-95">
                    <HeartHandshake className="h-4 w-4" /> {getStoryReactionCount(story.id, 'support')}
                  </button>
                </div>
              </article>
            )) : <p className="text-sm font-bold text-slate-300">No approved AhHa Stories yet. Submit a positive story for review.</p>}
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4"><h3 className="font-sans text-xl font-black text-white">Submit your AhHa Story</h3><input value={storyTitle} onChange={(e) => setStoryTitle(e.target.value)} placeholder="Story title" className="mt-3 w-full" /><textarea value={storyText} onChange={(e) => setStoryText(e.target.value)} placeholder="Share a hopeful moment, lesson, or win..." className="mt-3 min-h-[120px] w-full" /><button onClick={submitStory} className="btn-primary mt-3 inline-flex items-center gap-2"><Send className="h-4 w-4" /> Submit for review</button></div>
        </section>}

        {activeTab === 'Saved Inspiration' && <>
          <InspirationRow title="Saved Videos" items={savedVideoItems} type="video" emptyText="Save videos and readings that motivate you so you can come back to them on hard days." onOpen={setSelectedVideo} onSave={saveVideo} onShare={share} onReport={(item) => report(item, 'video')} />
          <InspirationRow title="Saved Reads" items={savedReadingItems} type="reading" emptyText="Save readings that encourage you so they are here when you need them." onOpen={setSelectedReading} onSave={saveReading} onShare={share} onReport={(item) => report(item, 'reading')} />
        </>}
      </div>
      <VideoPlayerModal video={selectedVideo} related={relatedVideos} onClose={() => setSelectedVideo(null)} onSave={saveVideo} onHelpful={helpfulVideo} onOpenRelated={setSelectedVideo} />
      <ReadingModal reading={selectedReading} related={relatedReadings} onClose={() => setSelectedReading(null)} onSave={saveReading} onHelpful={helpfulReading} onOpenRelated={setSelectedReading} />
    </PilotShell>
  );
}