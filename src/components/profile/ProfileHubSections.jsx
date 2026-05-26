import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HeartHandshake, Loader2, Lock, Settings, Trophy, UserRound } from 'lucide-react';
import { getTodayDashboard } from '@/services/dashboardService';
import { getCurrentUserProfile, updatePrivacySettings, updateProfile } from '@/services/profileService';

export default function ProfileHubSections() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState({});
  const profileQuery = useQuery({ queryKey: ['current-user-profile'], queryFn: getCurrentUserProfile });
  const user = profileQuery.data?.user;
  const profile = profileQuery.data?.profile;
  const dashboardQuery = useQuery({ queryKey: ['profile-dashboard', user?.email, profile?.id], queryFn: () => getTodayDashboard(user, profile), enabled: !!user?.email && !!profile });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['current-user-profile'] });
  const profileMutation = useMutation({ mutationFn: () => updateProfile(profile.id, draft), onSuccess: () => { setDraft({}); invalidate(); } });
  const privacyMutation = useMutation({ mutationFn: (updates) => updatePrivacySettings(profile, updates), onSuccess: invalidate });

  if (profileQuery.isLoading || dashboardQuery.isLoading) return <section className="rounded-[34px] border border-white/12 bg-white/10 p-6"><Loader2 className="h-5 w-5 animate-spin" /> Loading profile...</section>;
  if (profileQuery.error) return <section className="rounded-[34px] border border-red-300/30 bg-red-400/10 p-6">Profile could not load: {profileQuery.error.message}</section>;

  return (
    <div className="space-y-5">
      <section className="rounded-[34px] border border-white/12 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-200/80">Personal hub</p>
        <h2 className="mt-3 font-sans text-4xl font-black leading-tight text-white">{profile?.display_name || 'Profile'}</h2>
        <p className="mt-3 text-sm font-bold leading-relaxed text-slate-300">Your profile, privacy, progress, goals, and support circle are now backed by real database records.</p>
      </section>

      <section className="rounded-[30px] border border-white/12 bg-white/10 p-5 shadow-xl backdrop-blur-2xl">
        <h3 className="font-sans text-2xl font-black text-white"><UserRound className="mr-2 inline h-5 w-5" /> Profile details</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input value={draft.first_name ?? profile?.first_name ?? ''} onChange={(e) => setDraft((d) => ({ ...d, first_name: e.target.value }))} placeholder="First name" className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm font-bold text-white" />
          <input value={draft.display_name ?? profile?.display_name ?? ''} onChange={(e) => setDraft((d) => ({ ...d, display_name: e.target.value }))} placeholder="Display name" className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm font-bold text-white" />
          <input value={draft.zip_code ?? profile?.zip_code ?? ''} onChange={(e) => setDraft((d) => ({ ...d, zip_code: e.target.value }))} placeholder="ZIP code" className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm font-bold text-white" />
          <input type="date" value={draft.recovery_start_date ?? profile?.recovery_start_date ?? ''} onChange={(e) => setDraft((d) => ({ ...d, recovery_start_date: e.target.value }))} className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm font-bold text-white" />
        </div>
        <button onClick={() => Object.keys(draft).length && profileMutation.mutate()} className="btn-primary mt-4">Save profile</button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[30px] border border-white/12 bg-white/10 p-5 shadow-xl backdrop-blur-2xl"><Trophy className="h-5 w-5 text-amber-100" /><p className="mt-2 text-3xl font-black text-white">{dashboardQuery.data?.streak || 0}</p><p className="text-sm font-bold text-slate-300">check-in streak</p></div>
        <div className="rounded-[30px] border border-white/12 bg-white/10 p-5 shadow-xl backdrop-blur-2xl"><HeartHandshake className="h-5 w-5 text-blue-100" /><p className="mt-2 text-3xl font-black text-white">{dashboardQuery.data?.supportConnections?.length || 0}</p><p className="text-sm font-bold text-slate-300">support people</p></div>
        <div className="rounded-[30px] border border-white/12 bg-white/10 p-5 shadow-xl backdrop-blur-2xl"><Settings className="h-5 w-5 text-emerald-100" /><p className="mt-2 text-3xl font-black text-white">{dashboardQuery.data?.goals?.length || 0}</p><p className="text-sm font-bold text-slate-300">90-day goals</p></div>
      </section>

      <section className="rounded-[30px] border border-white/12 bg-white/10 p-5 shadow-xl backdrop-blur-2xl">
        <h3 className="font-sans text-2xl font-black text-white"><Lock className="mr-2 inline h-5 w-5" /> Privacy</h3>
        <p className="mt-2 text-sm font-bold text-slate-300">Recovery status, support circle, location, and legal details stay private unless you explicitly share them.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <button onClick={() => privacyMutation.mutate({ share_progress: !(profile?.privacy_settings_json?.share_progress) })} className="rounded-2xl border border-white/10 bg-white/8 p-3 text-sm font-black text-white">Share progress: {profile?.privacy_settings_json?.share_progress ? 'On' : 'Off'}</button>
          <button onClick={() => privacyMutation.mutate({ show_location: !(profile?.privacy_settings_json?.show_location) })} className="rounded-2xl border border-white/10 bg-white/8 p-3 text-sm font-black text-white">Show location: {profile?.privacy_settings_json?.show_location ? 'On' : 'Off'}</button>
          <button onClick={() => updateProfile(profile.id, { community_visibility: profile?.community_visibility === 'private' ? 'first_name_only' : 'private' }).then(invalidate)} className="rounded-2xl border border-white/10 bg-white/8 p-3 text-sm font-black text-white">Community: {profile?.community_visibility}</button>
        </div>
      </section>
    </div>
  );
}