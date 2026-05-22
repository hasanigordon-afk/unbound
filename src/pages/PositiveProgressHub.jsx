import React, { useEffect, useMemo, useState } from 'react';
import PilotShell from '@/components/pilot/PilotShell';
import ReZilientLogo from '@/components/shared/ReZilientLogo';
import { base44 } from '@/api/base44Client';
import { Award, CheckCircle2, HeartHandshake, MessageCircle, Plus, Send, ShieldCheck, Sparkles, Star, Trophy, UsersRound } from 'lucide-react';

const today = new Date().toISOString().slice(0, 10);
const progressTypes = [
  ['check_in', 'Completed check-in'], ['appointment', 'Attended appointment'], ['goal', 'Completed goal'], ['streak', 'Sober-day streak'],
  ['job', 'Job application submitted'], ['meeting', 'Meeting attended'], ['journal', 'Journal entry completed'], ['workout', 'Workout completed'],
  ['meditation', 'Meditation session'], ['community', 'Community participation'], ['achievement', 'Personal achievement'],
];
const reactions = ['Proud of you', 'Keep going', 'Big win', 'Respect', 'Inspired'];
const shareOptions = [
  ['share_achievements', 'Share achievements'], ['share_appointments_completed', 'Share appointments completed'], ['share_weekly_progress_summary', 'Share weekly progress summary'],
  ['share_goals_completed', 'Share goals completed'], ['share_encouragement_messages', 'Share encouragement messages'], ['hide_personal_journal_entries', 'Hide personal journal entries'], ['hide_sensitive_notes', 'Hide sensitive notes'],
];
const emptyPermission = { viewer_name: '', viewer_email: '', viewer_role: 'family', share_achievements: true, share_appointments_completed: true, share_weekly_progress_summary: true, share_goals_completed: true, share_encouragement_messages: true, hide_personal_journal_entries: true, hide_sensitive_notes: true, status: 'approved' };
const emptyProgress = { title: '', category: 'achievement', completed_date: today, count: 1, notes: '', share_with_supporters: true };
const emptyPost = { display_name: 'Anonymous Builder', post_type: 'win', message: '' };

function SoftCard({ children, className = '' }) {
  return <section className={`rounded-[30px] border border-white/12 bg-white/10 p-4 shadow-2xl backdrop-blur-2xl ${className}`}>{children}</section>;
}

function StatCard({ icon: Icon, label, value, detail }) {
  return <div className="rounded-[26px] border border-white/10 bg-white/8 p-4"><Icon className="mb-3 h-6 w-6 text-emerald-200" /><p className="text-3xl font-black text-white">{value}</p><p className="mt-1 text-sm font-black text-slate-100">{label}</p><p className="mt-1 text-xs text-slate-400">{detail}</p></div>;
}

export default function PositiveProgressHub() {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [posts, setPosts] = useState([]);
  const [progressForm, setProgressForm] = useState(emptyProgress);
  const [permissionForm, setPermissionForm] = useState(emptyPermission);
  const [messageForm, setMessageForm] = useState({ participant_name: '', participant_role: 'counselor', message: '', encouragement_reaction: 'Proud of you', thread_type: 'direct' });
  const [postForm, setPostForm] = useState(emptyPost);

  const loadData = async () => {
    const me = await base44.auth.me();
    setUser(me);
    const [progressRows, permissionRows, achievementRows, conversationRows, postRows] = await Promise.all([
      base44.entities.PositiveProgress.list('-completed_date', 100),
      base44.entities.ProgressSharePermission.list('-created_date', 50),
      base44.entities.AchievementVault.list('-earned_date', 100),
      base44.entities.SupportConversation.list('-created_date', 100),
      base44.entities.CommunityEncouragementPost.list('-created_date', 100),
    ]);
    setProgress(progressRows || []);
    setPermissions(permissionRows || []);
    setAchievements(achievementRows || []);
    setConversations(conversationRows || []);
    setPosts((postRows || []).filter((post) => post.moderation_status === 'approved'));
  };

  useEffect(() => { loadData(); }, []);

  const weeklyProgress = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return progress.filter((item) => !item.completed_date || new Date(`${item.completed_date}T12:00:00`) >= cutoff);
  }, [progress]);

  const winsCollected = achievements.length + progress.filter((item) => item.category === 'achievement').length;
  const stepsForward = progress.reduce((sum, item) => sum + (Number(item.count) || 1), 0);
  const weeklySummary = weeklyProgress.length
    ? `This week, you moved forward by collecting ${weeklyProgress.length} growth moments: ${weeklyProgress.slice(0, 5).map((item) => item.title).join(', ')}.`
    : 'This week is ready for new growth moments. Add a win when you are ready.';

  const saveProgress = async () => {
    if (!progressForm.title.trim()) return;
    const saved = await base44.entities.PositiveProgress.create({ ...progressForm, user_email: user?.email });
    setProgress((prev) => [saved, ...prev]);
    if (['appointment', 'goal', 'meeting', 'meditation', 'community', 'job'].includes(progressForm.category)) {
      const badge = await base44.entities.AchievementVault.create({ user_email: user?.email, title: progressForm.title, description: 'A positive step forward was added to your Achievement Vault.', badge_type: progressForm.category === 'job' ? 'job' : progressForm.category, earned_date: progressForm.completed_date, shared: true });
      setAchievements((prev) => [badge, ...prev]);
    }
    setProgressForm(emptyProgress);
  };

  const savePermission = async () => {
    if (!permissionForm.viewer_name.trim() || !permissionForm.viewer_email.trim()) return;
    const saved = await base44.entities.ProgressSharePermission.create({ ...permissionForm, user_email: user?.email });
    setPermissions((prev) => [saved, ...prev]);
    setPermissionForm(emptyPermission);
  };

  const sendSupportMessage = async () => {
    if (!messageForm.message.trim()) return;
    const saved = await base44.entities.SupportConversation.create({ ...messageForm, user_email: user?.email, read: false });
    setConversations((prev) => [saved, ...prev]);
    setMessageForm({ participant_name: '', participant_role: 'counselor', message: '', encouragement_reaction: 'Proud of you', thread_type: 'direct' });
  };

  const createPost = async () => {
    if (!postForm.message.trim()) return;
    const saved = await base44.entities.CommunityEncouragementPost.create({ ...postForm, user_email: user?.email, moderation_status: 'approved' });
    setPosts((prev) => [saved, ...prev]);
    setPostForm(emptyPost);
  };

  const reactToPost = async (post, reaction) => {
    const field = { 'Proud of you': 'reaction_proud', 'Keep going': 'reaction_keep_going', 'Big win': 'reaction_big_win', Respect: 'reaction_respect', Inspired: 'reaction_inspired' }[reaction];
    const next = { ...post, [field]: (post[field] || 0) + 1 };
    await base44.entities.CommunityEncouragementPost.update(post.id, { [field]: next[field] });
    setPosts((prev) => prev.map((item) => item.id === post.id ? next : item));
  };

  return (
    <PilotShell title="Positive Progress" subtitle="Your growth is witnessed, celebrated, and protected.">
      <div className="space-y-5">
        <SoftCard className="bg-gradient-to-br from-emerald-400/16 via-blue-400/10 to-amber-300/12">
          <div className="mb-4 flex items-center gap-3">
            <ReZilientLogo className="h-14 w-14" />
            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-200">Dignity-first sharing</p>
          </div>
          <h1 className="mt-2 font-sans text-4xl font-black tracking-tight">Progress made. Wins collected. Steps forward.</h1>
          <p className="mt-3 max-w-2xl text-sm font-bold text-slate-300">Share only the progress you choose with approved supporters. This space does not collect relapse logs, failure counters, missed-day shame, or negative scoring.</p>
        </SoftCard>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard icon={Sparkles} label="Growth moments" value={progress.length} detail="Positive actions saved" />
          <StatCard icon={Trophy} label="Wins collected" value={winsCollected} detail="Achievements and personal wins" />
          <StatCard icon={CheckCircle2} label="Steps forward" value={stepsForward} detail="Completed actions you chose to track" />
        </div>

        <SoftCard>
          <div className="mb-4 flex items-center gap-2"><Plus className="h-5 w-5 text-emerald-200" /><h2 className="font-sans text-2xl font-black">Add a positive progress moment</h2></div>
          <div className="grid gap-3 sm:grid-cols-2"><input placeholder="What win should be celebrated?" value={progressForm.title} onChange={(e) => setProgressForm({ ...progressForm, title: e.target.value })} /><select value={progressForm.category} onChange={(e) => setProgressForm({ ...progressForm, category: e.target.value })}>{progressTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><input type="date" value={progressForm.completed_date} onChange={(e) => setProgressForm({ ...progressForm, completed_date: e.target.value })} /><input type="number" min="1" value={progressForm.count} onChange={(e) => setProgressForm({ ...progressForm, count: e.target.value })} /><textarea placeholder="Optional encouragement note" value={progressForm.notes} onChange={(e) => setProgressForm({ ...progressForm, notes: e.target.value })} /><label className="flex items-center gap-2 rounded-2xl bg-white/8 p-3 text-sm font-bold"><input type="checkbox" checked={progressForm.share_with_supporters} onChange={(e) => setProgressForm({ ...progressForm, share_with_supporters: e.target.checked })} /> Share with approved supporters</label></div>
          <button onClick={saveProgress} className="mt-4 w-full rounded-3xl bg-white py-4 font-black text-slate-950">Save growth moment</button>
        </SoftCard>

        <SoftCard>
          <div className="mb-4 flex items-center gap-2"><UsersRound className="h-5 w-5 text-blue-200" /><h2 className="font-sans text-2xl font-black">Family & counselor progress view</h2></div>
          <div className="grid gap-3 sm:grid-cols-2"><input placeholder="Supporter name" value={permissionForm.viewer_name} onChange={(e) => setPermissionForm({ ...permissionForm, viewer_name: e.target.value })} /><input placeholder="Supporter email" value={permissionForm.viewer_email} onChange={(e) => setPermissionForm({ ...permissionForm, viewer_email: e.target.value })} /><select value={permissionForm.viewer_role} onChange={(e) => setPermissionForm({ ...permissionForm, viewer_role: e.target.value })}><option value="family">Family</option><option value="counselor">Counselor</option><option value="sponsor">Sponsor</option><option value="mentor">Mentor</option><option value="probation_officer">Probation officer</option><option value="facility_staff">Facility staff</option><option value="support_professional">Support professional</option></select></div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">{shareOptions.map(([key, label]) => <label key={key} className="flex items-center gap-2 rounded-2xl bg-white/8 p-3 text-sm font-bold"><input type="checkbox" checked={permissionForm[key]} onChange={(e) => setPermissionForm({ ...permissionForm, [key]: e.target.checked })} />{label}</label>)}</div>
          <button onClick={savePermission} className="mt-4 w-full rounded-3xl bg-white py-4 font-black text-slate-950">Approve supporter view</button>
          <div className="mt-4 grid gap-2">{permissions.map((item) => <div key={item.id} className="rounded-2xl bg-white/8 p-3"><p className="font-black text-white">{item.viewer_name}</p><p className="text-xs text-slate-400">{item.viewer_role.replaceAll('_', ' ')} · shared by your settings only</p></div>)}</div>
        </SoftCard>

        <SoftCard>
          <div className="mb-4 flex items-center gap-2"><MessageCircle className="h-5 w-5 text-amber-200" /><h2 className="font-sans text-2xl font-black">Real-time support conversations</h2></div>
          <div className="grid gap-3 sm:grid-cols-2"><input placeholder="Who are you messaging?" value={messageForm.participant_name} onChange={(e) => setMessageForm({ ...messageForm, participant_name: e.target.value })} /><select value={messageForm.participant_role} onChange={(e) => setMessageForm({ ...messageForm, participant_role: e.target.value })}><option value="counselor">Counselor</option><option value="sponsor">Sponsor</option><option value="mentor">Mentor</option><option value="family">Approved family member</option><option value="community_group">Community group</option><option value="professional_support">Professional support channel</option></select><select value={messageForm.thread_type} onChange={(e) => setMessageForm({ ...messageForm, thread_type: e.target.value })}><option value="direct">Direct chat</option><option value="group">Group thread</option></select><select value={messageForm.encouragement_reaction} onChange={(e) => setMessageForm({ ...messageForm, encouragement_reaction: e.target.value })}>{reactions.map((reaction) => <option key={reaction}>{reaction}</option>)}</select><textarea className="sm:col-span-2" placeholder="Send encouragement, a check-in reply, or a support message" value={messageForm.message} onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })} /></div>
          <button onClick={sendSupportMessage} className="mt-4 w-full rounded-3xl bg-white py-4 font-black text-slate-950"><Send className="mr-2 inline h-4 w-4" />Send supportive message</button>
          <div className="mt-4 space-y-2">{conversations.slice(0, 5).map((item) => <div key={item.id} className="rounded-2xl bg-white/8 p-3"><p className="text-sm font-black text-white">{item.participant_name || item.participant_role.replaceAll('_', ' ')}</p><p className="text-sm text-slate-300">{item.message}</p><span className="mt-2 inline-block rounded-full bg-emerald-300/15 px-3 py-1 text-xs font-black text-emerald-100">{item.encouragement_reaction}</span></div>)}</div>
        </SoftCard>

        <SoftCard>
          <div className="mb-4 flex items-center gap-2"><Award className="h-5 w-5 text-amber-200" /><h2 className="font-sans text-2xl font-black">My Wins / Achievement Vault</h2></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{achievements.length === 0 ? <p className="rounded-2xl bg-white/8 p-4 text-sm text-slate-300">Your Achievement Vault fills as you save positive progress moments.</p> : achievements.map((item) => <div key={item.id} className="rounded-[24px] border border-amber-200/20 bg-amber-300/10 p-4"><Star className="mb-3 h-6 w-6 text-amber-200" /><p className="font-black text-white">{item.title}</p><p className="mt-1 text-xs text-slate-300">{item.description}</p></div>)}</div>
        </SoftCard>

        <SoftCard>
          <div className="mb-4 flex items-center gap-2"><HeartHandshake className="h-5 w-5 text-rose-200" /><h2 className="font-sans text-2xl font-black">Weekly positive summary</h2></div>
          <p className="rounded-[24px] bg-white/8 p-4 text-lg font-black leading-relaxed text-white">{weeklySummary}</p>
        </SoftCard>

        <SoftCard>
          <div className="mb-4 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-200" /><h2 className="font-sans text-2xl font-black">Community encouragement feed</h2></div>
          <div className="grid gap-3 sm:grid-cols-2"><input placeholder="Display name" value={postForm.display_name} onChange={(e) => setPostForm({ ...postForm, display_name: e.target.value })} /><select value={postForm.post_type} onChange={(e) => setPostForm({ ...postForm, post_type: e.target.value })}><option value="win">Share a win</option><option value="encouragement">Encouragement</option><option value="comeback_moment">Comeback moment</option><option value="helpful_advice">Helpful advice</option></select><textarea className="sm:col-span-2" placeholder="Share something hopeful, helpful, or encouraging" value={postForm.message} onChange={(e) => setPostForm({ ...postForm, message: e.target.value })} /></div>
          <button onClick={createPost} className="mt-4 w-full rounded-3xl bg-white py-4 font-black text-slate-950">Share encouragement</button>
          <div className="mt-4 space-y-3">{posts.map((post) => <div key={post.id} className="rounded-[24px] bg-white/8 p-4"><p className="text-xs font-black uppercase tracking-wider text-blue-200">{post.post_type.replaceAll('_', ' ')}</p><p className="mt-1 font-black text-white">{post.display_name || 'Community member'}</p><p className="mt-2 text-sm text-slate-300">{post.message}</p><div className="mt-3 flex flex-wrap gap-2">{reactions.map((reaction) => <button key={reaction} onClick={() => reactToPost(post, reaction)} className="min-h-0 rounded-full bg-white/10 px-3 py-2 text-xs font-black text-white">{reaction}</button>)}</div></div>)}</div>
        </SoftCard>
      </div>
    </PilotShell>
  );
}