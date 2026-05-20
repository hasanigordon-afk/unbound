import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Camera, Edit3, HeartHandshake, Image, LogOut, MapPin, MessageSquareText, Shield, Sparkles, Star, Trophy, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";

function SectionCard({ icon: Icon, title, description, children, action }) {
  return (
    <section className="profile-section-card">
      <div className="profile-section-head">
        <div className="profile-section-icon"><Icon size={20} /></div>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyLine({ children, onEdit }) {
  return <button className="profile-empty-line" onClick={onEdit}>{children}</button>;
}

export default function ProfileDailySections({ user, profile, firstName, initials, completion, streak, onEdit }) {
  const location = profile.location_city || profile.hometown;
  const wins = [
    `${streak || 0} day check-in streak`,
    profile.what_im_building || "Still showing up",
    profile.motivation || "Choosing one next step",
  ];

  return (
    <main className="profile-redesign-shell">
      <section className="profile-identity-hero card-glow">
        <div className="profile-avatar">{initials}</div>
        <div>
          <p className="section-label">Identity</p>
          <h1>{user?.full_name || firstName}</h1>
          {location && <p className="profile-location"><MapPin size={13} /> {location}{profile.location_state ? `, ${profile.location_state}` : ""}</p>}
          <p className="profile-quote">{profile.personal_quote ? `“${profile.personal_quote}”` : "Your profile is your reminder: you are more than what happened."}</p>
        </div>
        <button className="btn-ghost profile-edit-btn" onClick={onEdit}><Edit3 size={15} /> Edit</button>
      </section>

      <div className="profile-progress-card">
        <span>Profile clarity</span>
        <strong>{completion}%</strong>
        <div><i style={{ width: `${completion}%` }} /></div>
      </div>

      <div className="profile-section-grid">
        <SectionCard icon={Shield} title="Identity" description="Your story, roots, values, and what keeps you grounded.">
          {profile.bio ? <p>{profile.bio}</p> : <EmptyLine onEdit={onEdit}>Add who you are beyond the struggle.</EmptyLine>}
          <div className="profile-chip-row">
            {profile.hobbies?.slice(0, 5).map((hobby) => <span key={hobby}>{hobby}</span>)}
          </div>
        </SectionCard>

        <SectionCard icon={Users} title="Support Circle" description="The people and professionals who help you stay connected.">
          <div className="profile-link-list">
            <Link to="/ClientConnectionsPage"><HeartHandshake size={16} /> Manage support connections <ArrowRight size={14} /></Link>
            <Link to="/InnerCircle"><Users size={16} /> Inner Circle <ArrowRight size={14} /></Link>
            <Link to="/ParticipantMessages"><MessageSquareText size={16} /> Messages <ArrowRight size={14} /></Link>
          </div>
        </SectionCard>

        <SectionCard icon={Camera} title="Positive Memories" description="Places, moments, and reminders that still feel like home.">
          {profile.core_memories ? <p className="memory-text">“{profile.core_memories}”</p> : <EmptyLine onEdit={onEdit}>Add a memory that makes you smile.</EmptyLine>}
          {profile.places_i_love?.length > 0 && <div className="profile-chip-row">{profile.places_i_love.map((place) => <span key={place}>📍 {place}</span>)}</div>}
        </SectionCard>

        <SectionCard icon={Trophy} title="Wins" description="Small wins count. Progress becomes visible here.">
          <div className="wins-list">
            {wins.map((win, index) => <div key={index}><Trophy size={15} /><span>{win}</span></div>)}
          </div>
        </SectionCard>

        <SectionCard icon={BookOpen} title="Counselor Notes" description="A calmer place for guidance, plans, and professional support.">
          <div className="profile-link-list">
            <Link to="/CounselorGuide"><BookOpen size={16} /> Counselor Teaching Guide <ArrowRight size={14} /></Link>
            <Link to="/PatientSummaryDashboard"><Star size={16} /> Progress summary <ArrowRight size={14} /></Link>
          </div>
        </SectionCard>

        <SectionCard icon={Image} title="Vision Board" description="What you are building toward — purpose, dreams, and mission.">
          {profile.long_term_dream || profile.what_im_building ? (
            <div className="vision-copy">
              {profile.what_im_building && <p><strong>Now:</strong> {profile.what_im_building}</p>}
              {profile.long_term_dream && <p><strong>Future:</strong> {profile.long_term_dream}</p>}
            </div>
          ) : <EmptyLine onEdit={onEdit}>Add what you are building toward.</EmptyLine>}
          <Link className="vision-board-link" to="/TopFiveNonNegotiables"><Sparkles size={15} /> Open Mission Board</Link>
        </SectionCard>
      </div>

      <button className="profile-signout" onClick={() => base44.auth.logout()}><LogOut size={15} /> Sign Out</button>

      <style>{`
        .profile-redesign-shell { max-width: 1080px; margin: 0 auto; padding: clamp(18px, 3vw, 34px) clamp(14px, 3vw, 28px) 120px; color: var(--text); }
        .profile-identity-hero { display: grid; grid-template-columns: 82px 1fr auto; gap: 18px; align-items: center; padding: clamp(22px, 4vw, 38px); margin-bottom: 16px; }
        .profile-avatar { width: 82px; height: 82px; border-radius: 28px; display: grid; place-items: center; color: #07101f; font-size: 24px; font-weight: 950; background: linear-gradient(135deg, var(--gold), #22D3EE); box-shadow: 0 0 34px rgba(240,183,83,.24); }
        .profile-identity-hero h1 { margin: 0; font-size: clamp(34px, 5vw, 62px); line-height: .95; letter-spacing: -.045em; }
        .profile-location { display: inline-flex; align-items: center; gap: 5px; color: var(--text-muted); margin: 8px 0 0; font-weight: 800; }
        .profile-quote { color: var(--gold); margin: 12px 0 0; font-size: 15px; line-height: 1.55; font-weight: 800; }
        .profile-edit-btn { min-height: 44px; padding: 0 18px; display: inline-flex; align-items: center; gap: 7px; }
        .profile-progress-card { margin-bottom: 18px; padding: 14px 18px; border-radius: 24px; background: rgba(255,255,255,.07); border: 1px solid rgba(190,225,255,.14); display: grid; grid-template-columns: 1fr auto; gap: 10px; align-items: center; }
        .profile-progress-card span { color: var(--text-muted); font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: .12em; }
        .profile-progress-card strong { color: var(--gold); font-size: 22px; }
        .profile-progress-card div { grid-column: 1 / -1; height: 7px; border-radius: 999px; overflow: hidden; background: rgba(255,255,255,.09); }
        .profile-progress-card i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--accent), #22D3EE, var(--gold)); box-shadow: 0 0 18px rgba(34,211,238,.24); }
        .profile-section-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 15px; }
        .profile-section-card { min-height: 230px; padding: 20px; border-radius: 28px; background: linear-gradient(145deg, rgba(255,255,255,.10), rgba(13,18,32,.72)); border: 1px solid rgba(190,225,255,.15); box-shadow: 0 20px 54px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.10); backdrop-filter: blur(24px) saturate(160%); }
        .profile-section-head { display: grid; grid-template-columns: 48px 1fr auto; gap: 13px; align-items: start; margin-bottom: 16px; }
        .profile-section-icon { width: 48px; height: 48px; border-radius: 17px; display: grid; place-items: center; color: #22D3EE; background: rgba(34,211,238,.10); border: 1px solid rgba(34,211,238,.22); box-shadow: 0 0 22px rgba(34,211,238,.13); }
        .profile-section-card h2 { margin: 0; font-size: 22px; }
        .profile-section-card p { color: var(--text-muted); line-height: 1.65; margin: 0; }
        .profile-section-head p { font-size: 13px; margin-top: 4px; }
        .profile-empty-line { width: 100%; min-height: 72px; border-radius: 18px; background: rgba(255,255,255,.055); border: 1px dashed rgba(190,225,255,.22); color: var(--text-muted); text-align: left; padding: 14px; font-weight: 800; }
        .profile-chip-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
        .profile-chip-row span { border-radius: 999px; padding: 7px 11px; background: rgba(255,255,255,.065); border: 1px solid rgba(255,255,255,.11); color: var(--text); font-size: 12px; font-weight: 850; }
        .profile-link-list, .wins-list, .vision-copy { display: grid; gap: 9px; }
        .profile-link-list a, .wins-list div, .vision-board-link { min-height: 46px; border-radius: 16px; padding: 0 13px; display: flex; align-items: center; gap: 9px; color: var(--text); text-decoration: none; background: rgba(255,255,255,.055); border: 1px solid rgba(255,255,255,.10); font-size: 13px; font-weight: 900; }
        .profile-link-list a svg:last-child { margin-left: auto; color: var(--text-dim); }
        .wins-list svg, .vision-board-link svg { color: var(--gold); flex-shrink: 0; }
        .memory-text { color: var(--gold) !important; font-family: 'Lora', Georgia, serif; font-size: 18px; }
        .vision-copy strong { color: var(--gold); }
        .vision-board-link { margin-top: 12px; justify-content: center; color: #07101f; background: linear-gradient(135deg, var(--gold), #22D3EE); }
        .profile-signout { width: 100%; margin-top: 18px; min-height: 50px; border-radius: 999px; display: flex; justify-content: center; align-items: center; gap: 8px; border: 1px solid rgba(248,113,113,.24); background: rgba(248,113,113,.08); color: #F87171; font-weight: 900; }
        @media (max-width: 780px) { .profile-section-grid, .profile-identity-hero { grid-template-columns: 1fr; } .profile-edit-btn { width: fit-content; } }
      `}</style>
    </main>
  );
}