import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Send } from 'lucide-react';
import PilotShell from '@/components/pilot/PilotShell';
import { createPost, getCommunityFeed, getCounselors, getGroupMembers, getGroups, getMembers, getSponsors, joinGroup, leaveGroup } from '@/services/communityService';
import { searchMeetings } from '@/services/meetingService';
import { searchResources } from '@/services/resourceService';
import { getCurrentUser } from '@/services/serviceUtils';

const tabs = ['Members', 'Counselors', 'Sponsors', 'AA Meetings', 'NA Meetings', 'Peer Groups', 'Community Feed', 'Support Directory'];
const card = 'rounded-[30px] border border-white/12 bg-white/10 p-5 shadow-xl backdrop-blur-2xl';

export default function CommunityHub() {
  const [active, setActive] = useState('Members');
  const [postBody, setPostBody] = useState('');
  const queryClient = useQueryClient();
  const userQuery = useQuery({ queryKey: ['current-user'], queryFn: getCurrentUser });
  const user = userQuery.data;
  const membersQuery = useQuery({ queryKey: ['community-members'], queryFn: getMembers });
  const counselorsQuery = useQuery({ queryKey: ['community-counselors', user?.email], queryFn: () => getCounselors(user), enabled: !!user?.email });
  const sponsorsQuery = useQuery({ queryKey: ['community-sponsors', user?.email], queryFn: () => getSponsors(user), enabled: !!user?.email });
  const aaQuery = useQuery({ queryKey: ['meetings-aa'], queryFn: () => searchMeetings({ meetingType: 'AA' }) });
  const naQuery = useQuery({ queryKey: ['meetings-na'], queryFn: () => searchMeetings({ meetingType: 'NA' }) });
  const groupsQuery = useQuery({ queryKey: ['community-groups'], queryFn: getGroups });
  const membershipsQuery = useQuery({ queryKey: ['group-memberships', user?.email], queryFn: () => getGroupMembers(user), enabled: !!user?.email });
  const feedQuery = useQuery({ queryKey: ['community-feed'], queryFn: getCommunityFeed });
  const resourcesQuery = useQuery({ queryKey: ['community-support-directory'], queryFn: () => searchResources({ crisisAvailable: true }) });
  const postMutation = useMutation({ mutationFn: () => createPost(user, { body: postBody, category: 'support', visibility: 'anonymous' }), onSuccess: () => { setPostBody(''); queryClient.invalidateQueries({ queryKey: ['community-feed'] }); } });
  const joinMutation = useMutation({ mutationFn: (group) => joinGroup(user, group), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['group-memberships'] }) });
  const leaveMutation = useMutation({ mutationFn: (group) => leaveGroup(user, group), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['group-memberships'] }) });

  const memberships = membershipsQuery.data || [];

  const renderPeople = (items, empty) => items?.length ? (
    <div className="grid gap-3 sm:grid-cols-2">{items.map((item) => <div key={item.id} className={card}><p className="font-black text-white">{item.display_name || item.name || item.first_name}</p><p className="mt-1 text-sm font-bold text-slate-300">{item.role || item.location_state || 'Visible community member'}</p></div>)}</div>
  ) : <p className={card}>{empty}</p>;

  const renderMeetings = (query, empty) => query.isLoading ? <p className={card}><Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Loading meetings...</p> : query.data?.length ? (
    <div className="grid gap-3">{query.data.map((meeting) => <article key={meeting.id} className={card}><p className="font-black text-white">{meeting.name}</p><p className="mt-1 text-sm font-bold text-slate-300">{meeting.day_of_week != null ? `Day ${meeting.day_of_week}` : 'Day not verified'} · {meeting.start_time || 'Time not verified'} · {meeting.city}, {meeting.state}</p><p className="mt-2 text-xs font-bold text-slate-500">Source: {meeting.source_name || 'Admin/imported meeting database'}</p></article>)}</div>
  ) : <p className={card}>{empty}</p>;

  return (
    <PilotShell title="Community" subtitle="Privacy-first members, support, meetings, groups, posts, and directory tools.">
      <div className="space-y-5">
        <section className="rounded-[34px] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-200/80">Community safety</p>
          <h2 className="mt-2 font-sans text-3xl font-black text-white">Consent first. No private recovery details exposed.</h2>
          <p className="mt-2 text-sm font-bold text-slate-300">Members appear only if they opt into visibility. This app is not emergency services, medical advice, diagnosis, or treatment.</p>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">{tabs.map((tab) => <button key={tab} onClick={() => setActive(tab)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-black ${active === tab ? 'bg-white text-slate-950' : 'border border-white/12 bg-white/10 text-white'}`}>{tab}</button>)}</div>
        </section>

        {active === 'Members' && renderPeople(membersQuery.data, 'No visible members yet. Community visibility is optional and private by default.')}
        {active === 'Counselors' && renderPeople(counselorsQuery.data, 'No assigned counselor connection yet. Add a counselor in your Support System; communication is not enabled until contact info exists.')}
        {active === 'Sponsors' && renderPeople(sponsorsQuery.data, 'No sponsor connection yet. Add a sponsor manually from your dashboard support system.')}
        {active === 'AA Meetings' && renderMeetings(aaQuery, 'No AA meeting records are imported yet. Configure a Meeting Guide feed or upload AA meetings by CSV.')}
        {active === 'NA Meetings' && renderMeetings(naQuery, 'No NA meeting records are imported yet. Use an official/regional NA feed or admin CSV import; restricted sources are not scraped.')}
        {active === 'Peer Groups' && (
          groupsQuery.data?.length ? <div className="grid gap-3">{groupsQuery.data.map((group) => {
            const joined = memberships.some((item) => item.group_id === group.id);
            return <article key={group.id} className={card}><p className="font-black text-white">{group.name}</p><p className="mt-1 text-sm font-bold text-slate-300">{group.description}</p><button onClick={() => (joined ? leaveMutation.mutate(group) : joinMutation.mutate(group))} className={`mt-4 rounded-full px-4 py-2 text-xs font-black ${joined ? 'bg-amber-300 text-slate-950' : 'bg-white text-slate-950'}`}>{joined ? 'Leave group' : 'Join group'}</button></article>;
          })}</div> : <p className={card}>No peer groups have been created yet. Admins can add real groups for early recovery, reentry, veterans, employment, wellness, parenting, sober living, and mental health.</p>
        )}
        {active === 'Community Feed' && (
          <div className="space-y-3">
            <section className={card}><textarea value={postBody} onChange={(e) => setPostBody(e.target.value)} placeholder="Post encouragement, a win, or a question..." className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm font-bold text-white placeholder:text-slate-500" /><button onClick={() => postBody.trim() && postMutation.mutate()} className="btn-primary mt-3"><Send className="mr-2 inline h-4 w-4" /> Submit for moderation</button></section>
            {feedQuery.data?.length ? feedQuery.data.map((post) => <article key={post.id} className={card}><p className="font-black text-white">{post.title || 'Community post'}</p><p className="mt-2 text-sm font-bold text-slate-300">{post.content}</p><p className="mt-3 text-xs font-black text-slate-500">Moderation: {post.moderation_status || 'approved'}</p></article>) : <p className={card}>No community posts yet. Posts save to the database and enter moderation before public display.</p>}
          </div>
        )}
        {active === 'Support Directory' && (
          resourcesQuery.data?.length ? <div className="grid gap-3">{resourcesQuery.data.slice(0, 8).map((resource) => <article key={resource.id} className={card}><p className="font-black text-white">{resource.name}</p><p className="mt-1 text-sm font-bold text-slate-300">{resource.category} · {resource.phone || 'Phone not verified'}</p></article>)}</div> : <p className={card}>No crisis/support directory resources are imported yet. Add verified hotline, counselor, mentor, and facility contacts through resource import.</p>
        )}
      </div>
    </PilotShell>
  );
}