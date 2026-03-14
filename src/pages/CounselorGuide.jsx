import React, { useState } from "react";
import { ChevronDown, ChevronUp, ArrowLeft, Clock, Users, User, CheckCircle2, BookOpen, MessageSquare, Target, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";

const C = {
  teal:    "#3ECFBF",
  gold:    "#C9A96E",
  navy:    "#0B1220",
  emerald: "#10B981",
  indigo:  "#5B6EF5",
  slate:   "rgba(255,255,255,0.62)",
  muted:   "rgba(255,255,255,0.30)",
};

// ── Shared primitives ──────────────────────────────────────────
function Card({ children, style={} }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)",
      borderRadius:20, padding:"20px 18px", marginBottom:14, ...style }}>
      {children}
    </div>
  );
}

function SLabel({ children, color=C.muted }) {
  return (
    <p style={{ fontSize:11, fontWeight:700, color, textTransform:"uppercase",
      letterSpacing:".09em", marginBottom:10 }}>{children}</p>
  );
}

function Bullet({ items, color=C.gold }) {
  return (
    <div>{items.map((item,i)=>(
      <div key={i} style={{ display:"flex", gap:10, marginBottom:i<items.length-1?10:0 }}>
        <span style={{ color, fontWeight:900, flexShrink:0, marginTop:2 }}>•</span>
        <p style={{ fontSize:14, color:C.slate, lineHeight:1.65 }}>{item}</p>
      </div>
    ))}</div>
  );
}

function Script({ children }) {
  return (
    <div style={{ background:"rgba(201,169,110,0.07)", border:"1px solid rgba(201,169,110,0.2)",
      borderRadius:14, padding:"14px 16px", marginTop:14 }}>
      <p style={{ fontSize:11, fontWeight:700, color:C.gold, textTransform:"uppercase", letterSpacing:".08em", marginBottom:8 }}>💬 Script / What to Say</p>
      <p style={{ fontSize:14, color:"rgba(255,255,255,0.65)", lineHeight:1.7, fontStyle:"italic" }}>{children}</p>
    </div>
  );
}

function Accordion({ title, emoji, time, mode, color=C.teal, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)",
      borderRadius:20, overflow:"hidden", marginBottom:12 }}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        width:"100%", padding:"18px 20px", background:"none", border:"none", cursor:"pointer",
        display:"flex", alignItems:"center", gap:14, textAlign:"left" }}>
        {emoji && <span style={{ fontSize:22, flexShrink:0 }}>{emoji}</span>}
        <div style={{ flex:1 }}>
          <p style={{ fontSize:15, fontWeight:800, color:"#fff", lineHeight:1.3, marginBottom: (time||mode)?4:0 }}>{title}</p>
          {(time||mode) && (
            <div style={{ display:"flex", gap:12 }}>
              {time && <span style={{ fontSize:11, color:C.muted, display:"flex", alignItems:"center", gap:4 }}><Clock style={{ width:11, height:11 }}/>{time}</span>}
              {mode && <span style={{ fontSize:11, color:C.muted, display:"flex", alignItems:"center", gap:4 }}><Users style={{ width:11, height:11 }}/>{mode}</span>}
            </div>
          )}
        </div>
        {open ? <ChevronUp style={{ width:18, height:18, color:C.muted, flexShrink:0 }}/> :
                <ChevronDown style={{ width:18, height:18, color:C.muted, flexShrink:0 }}/>}
      </button>
      {open && (
        <div style={{ padding:"0 20px 22px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── TAB: OVERVIEW ──────────────────────────────────────────────
function OverviewTab() {
  return (
    <div>
      {/* What this app is */}
      <Card style={{ background:"rgba(62,207,191,0.06)", borderColor:"rgba(62,207,191,0.2)" }}>
        <SLabel color={C.teal}>1 — What Unbound Is</SLabel>
        <p style={{ fontSize:17, fontWeight:800, color:"#fff", marginBottom:12 }}>A recovery support platform built for life after treatment.</p>
        <Bullet color={C.teal} items={[
          "A personal aftercare accountability tool — not a monitoring system",
          "A daily check-in habit tracker for mood, cravings, meetings, and sponsor contact",
          "A resource hub for housing, employment, benefits, and reentry support",
          "A reflection space where patients build their identity profile",
          "A safe community where people in recovery share wins and support each other",
          "A private, patient-owned tool — the facility does not monitor it",
        ]}/>
      </Card>

      {/* Why before discharge */}
      <Card>
        <SLabel>2 — Why Introduce It Before Discharge</SLabel>
        <p style={{ fontSize:16, fontWeight:800, color:"#fff", marginBottom:12 }}>
          Familiarity at discharge dramatically increases post-treatment use.
        </p>
        <Bullet items={[
          "Patients who set up a support tool in treatment are far more likely to use it after discharge",
          "The window of motivation is highest while they're still in a structured environment",
          "Leaving with the app already personal to them creates real continuity",
          "It gives the facility confidence that they provided every available support tool",
          "It helps patients enter the real world with something already working for them",
          "It reduces the isolation that drives most relapses in the first 90 days",
        ]}/>
        <Script>
          "You may or may not use this app after you leave. That's entirely your choice. But we want you to leave here with every possible tool already in your hands — so that when you need something, you already know where to find it."
        </Script>
      </Card>

      {/* Best time to introduce */}
      <Card>
        <SLabel>3 — Best Time to Introduce the App</SLabel>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
          {[
            { icon:"🏁", label:"Final week of treatment", color:C.emerald },
            { icon:"📋", label:"Discharge planning sessions", color:C.teal },
            { icon:"👥", label:"Aftercare group sessions", color:C.gold },
            { icon:"🪑", label:"One-on-one counselor meetings", color:C.indigo },
          ].map(item=>(
            <div key={item.label} style={{ background:`rgba(255,255,255,0.04)`, border:`1px solid rgba(255,255,255,0.08)`,
              borderRadius:14, padding:"14px 14px" }}>
              <span style={{ fontSize:20 }}>{item.icon}</span>
              <p style={{ fontSize:13, fontWeight:700, color:item.color, marginTop:8, lineHeight:1.4 }}>{item.label}</p>
            </div>
          ))}
        </div>
        <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:14, padding:"14px 16px" }}>
          <p style={{ fontSize:13, fontWeight:700, color:"#fff", marginBottom:6 }}>🎯 Target Outcome</p>
          <p style={{ fontSize:14, color:C.slate, lineHeight:1.6 }}>
            Every patient leaves treatment with their profile at least 60% complete, having used the daily check-in at least once, and understanding how to access resources.
          </p>
        </div>
      </Card>

      {/* What patients leave with */}
      <Card style={{ background:"rgba(16,185,129,0.05)", borderColor:"rgba(16,185,129,0.2)" }}>
        <SLabel color={C.emerald}>The Facility's Promise to Each Patient</SLabel>
        <p style={{ fontSize:15, color:C.slate, lineHeight:1.7 }}>
          When you introduce this app, you're giving patients the ability to say:
        </p>
        <div style={{ marginTop:14 }}>
          {[
            "\"I already have a support tool set up.\"",
            "\"I know where to find housing, jobs, and benefits.\"",
            "\"I have a place to check in with myself every day.\"",
            "\"My profile already reflects who I am and what I'm building.\"",
            "\"I'm not starting from zero when I walk out that door.\"",
          ].map((q,i)=>(
            <div key={i} style={{ display:"flex", gap:10, marginBottom:i<4?10:0 }}>
              <CheckCircle2 style={{ width:16, height:16, color:C.emerald, flexShrink:0, marginTop:2 }}/>
              <p style={{ fontSize:14, color:C.slate, lineHeight:1.6, fontStyle:"italic" }}>{q}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── TAB: LESSON PLANS ─────────────────────────────────────────
function LessonsTab() {
  return (
    <div>
      <p style={{ fontSize:13, color:C.muted, marginBottom:16, lineHeight:1.6 }}>
        Two complete lesson formats — one for groups, one for individual sessions. Each includes a script, timing, and reflection prompts.
      </p>

      {/* ── GROUP VERSION ─────────────────────────────────────── */}
      <div style={{ background:"rgba(62,207,191,0.06)", border:"1px solid rgba(62,207,191,0.2)",
        borderRadius:20, padding:"18px 18px", marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
          <Users style={{ width:18, height:18, color:C.teal }}/>
          <p style={{ fontSize:16, fontWeight:800, color:C.teal }}>Group Session Version</p>
        </div>
        <p style={{ fontSize:13, color:C.muted, marginBottom:0 }}>30–45 minutes · Aftercare group or discharge class</p>
      </div>

      <Accordion emoji="👋" title="Opening Script (5 min)" time="5 min" color={C.teal}>
        <p style={{ fontSize:14, color:C.slate, lineHeight:1.65, marginTop:14 }}>
          Open the session by grounding the group in identity — not addiction.
        </p>
        <Script>
          "Before we get started, I want you all to set aside the clinical language for a minute. You are not a diagnosis. You are not just someone in recovery. You are a person with a history, a personality, things you love, places that feel like home, and a future you're building.{"\n\n"}
          Today we're going to spend some time with a tool that's going to travel with you when you leave here. It's called Unbound. It's not a monitoring app. It's yours. No one from this facility can see your private information. It belongs to you."
        </Script>
      </Accordion>

      <Accordion emoji="📱" title="App Tour (10 min)" time="10 min" color={C.teal}>
        <div style={{ marginTop:14 }}>
          <SLabel>Walk through these sections together:</SLabel>
          {[
            { step:"1", title:"Home Dashboard", desc:"Show the daily streak, check-in button, and progress snapshot" },
            { step:"2", title:"Daily Check-In", desc:"Walk through a mock check-in together — mood, cravings, meeting, sponsor" },
            { step:"3", title:"Find Help Now", desc:"Show housing, employment, and benefits resources by location" },
            { step:"4", title:"My Profile", desc:"Show the identity profile — explain it reflects who they are, not just their history" },
            { step:"5", title:"Community", desc:"Show the Voices of Recovery section — anonymous, real, supportive" },
          ].map(item=>(
            <div key={item.step} style={{ display:"flex", gap:12, marginBottom:12 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(62,207,191,0.12)",
                display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ fontSize:12, fontWeight:900, color:C.teal }}>{item.step}</span>
              </div>
              <div>
                <p style={{ fontSize:14, fontWeight:700, color:"#fff", marginBottom:2 }}>{item.title}</p>
                <p style={{ fontSize:13, color:C.muted }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Accordion>

      <Accordion emoji="✍️" title="Profile Completion Exercise (15 min)" time="15 min" color={C.gold}>
        <div style={{ marginTop:14 }}>
          <p style={{ fontSize:14, color:C.slate, lineHeight:1.65, marginBottom:14 }}>
            Guide the group through the Guided Profile Setup together. Each person fills out their own answers while you facilitate reflection.
          </p>
          <Script>
            "Open your profile. We're going to go through each section together. Take your time — there are no right or wrong answers. If a question feels too personal, skip it and come back. This is about you remembering who you are."
          </Script>
          <div style={{ marginTop:16 }}>
            <SLabel>Section-by-Section Group Prompts:</SLabel>
            {[
              { section:"About Me", prompt:"\"Who are you when addiction isn't in the room? What do you want people to know about you?\"" },
              { section:"Where I'm From", prompt:"\"What neighborhood, city, or place helped shape who you are? What did that place teach you?\"" },
              { section:"Places I Love", prompt:"\"Where do you feel most yourself? A court, a porch, a park, a relative's kitchen — what places feel like home?\"" },
              { section:"What Keeps Me Grounded", prompt:"\"What brings you back to yourself when life gets hard? A person, a sound, a smell, a memory — what grounds you?\"" },
              { section:"Hobbies & Interests", prompt:"\"What did you love doing before everything got complicated? What do you want to get back?\"" },
              { section:"Goals & Motivation", prompt:"\"What does your life look like in one year if everything goes the way you hope?\"" },
            ].map((item,i)=>(
              <div key={i} style={{ marginBottom:14, paddingBottom:14,
                borderBottom: i<5 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <p style={{ fontSize:13, fontWeight:800, color:C.gold, marginBottom:6 }}>{item.section}</p>
                <p style={{ fontSize:14, color:C.slate, lineHeight:1.6, fontStyle:"italic" }}>{item.prompt}</p>
              </div>
            ))}
          </div>
        </div>
      </Accordion>

      <Accordion emoji="🙌" title="Group Discussion & Closing (5–10 min)" time="5–10 min" color={C.emerald}>
        <div style={{ marginTop:14 }}>
          <SLabel>Optional Sharing Prompts (never force):</SLabel>
          <Bullet color={C.emerald} items={[
            "\"Would anyone like to share one thing they added to their profile today?\"",
            "\"What section felt the most meaningful or surprising to you?\"",
            "\"Is there anything in the app that you think you'd actually use after you leave?\"",
          ]}/>
          <Script>
            "You all just did something meaningful. You took time to remember who you are — not just who you've been struggling to be. That profile is yours to keep, update, and use. When things get hard after you leave — and they will get hard — you'll have somewhere to go. You already know the app. You already have a start. That's not nothing. That's something real."
          </Script>
        </div>
      </Accordion>

      {/* ── ONE-ON-ONE VERSION ────────────────────────────────── */}
      <div style={{ background:"rgba(91,110,245,0.06)", border:"1px solid rgba(91,110,245,0.2)",
        borderRadius:20, padding:"18px 18px", marginTop:20, marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
          <User style={{ width:18, height:18, color:C.indigo }}/>
          <p style={{ fontSize:16, fontWeight:800, color:C.indigo }}>One-on-One / Case Manager Version</p>
        </div>
        <p style={{ fontSize:13, color:C.muted }}>15–20 minutes · Individual counseling or discharge planning session</p>
      </div>

      <Accordion emoji="🪑" title="Individual Setup Session" time="15–20 min" color={C.indigo}>
        <div style={{ marginTop:14 }}>
          <SLabel>Session Flow:</SLabel>
          {[
            { t:"Open with context (2 min)", d:"\"We want to make sure you leave here with more than a discharge plan. This app is a support tool you can use after treatment — let me show you how it works.\"" },
            { t:"App overview (3 min)", d:"Open the app together. Show the home screen, check-in button, and the profile." },
            { t:"Profile completion (8–10 min)", d:"Walk through the profile together. Ask questions conversationally — don't make it feel like a form. If they get stuck, offer the prompt and move on." },
            { t:"Check-in demo (2 min)", d:"Do one check-in together. Let them see how fast it is." },
            { t:"Close with encouragement (1–2 min)", d:"Affirm what they filled out. Tell them the app is theirs and the decision to use it is theirs." },
          ].map((item,i)=>(
            <div key={i} style={{ display:"flex", gap:12, marginBottom:14 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(91,110,245,0.12)",
                display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:2 }}>
                <span style={{ fontSize:12, fontWeight:900, color:C.indigo }}>{i+1}</span>
              </div>
              <div>
                <p style={{ fontSize:14, fontWeight:700, color:"#fff", marginBottom:4 }}>{item.t}</p>
                <p style={{ fontSize:14, color:C.muted, lineHeight:1.6, fontStyle:"italic" }}>"{item.d}"</p>
              </div>
            </div>
          ))}
          <SLabel>Discharge-Focused Talking Points:</SLabel>
          <Bullet color={C.indigo} items={[
            "\"What's your biggest fear about the first 30 days out?\" → Show them the resource most relevant to that fear",
            "\"Who's in your support system right now?\" → Show them how to add contacts and use the messaging features",
            "\"What time of day do you think you'd check in?\" → Set the habit expectation now",
            "\"What's one goal you have for the next 90 days?\" → Add it to their profile Goals section together",
          ]}/>
        </div>
      </Accordion>
    </div>
  );
}

// ── TAB: PROFILE GUIDE ────────────────────────────────────────
function ProfileTab() {
  const sections = [
    {
      emoji:"✍️", title:"About Me", color:C.teal,
      why: "Reconnects patients with identity beyond addiction. Many patients struggle to describe themselves without referencing their struggles.",
      prompt: "Who are you when addiction isn't in the room? What do you want people to know about you that has nothing to do with your history?",
      facilitatorTip: "If a patient freezes, offer: 'Tell me three things you love. Tell me what your friends used to call you. Tell me what you're good at.' Start with the easy stuff.",
      example: "I'm a father of two who loves music and cooking. I've always been the person people come to when things get hard. I'm funny when I'm comfortable and I work hard at everything I do.",
    },
    {
      emoji:"🌳", title:"Where I'm From", color:"#A78BFA",
      why: "Roots create context. Where someone grew up often carries both pride and pain — this section invites the pride.",
      prompt: "Where did you grow up? What neighborhood, city, or community helped shape who you are? What did that place teach you?",
      facilitatorTip: "Focus on the positive associations — the block parties, the corner store, grandma's house. The hard memories don't need to dominate this section.",
      example: "I grew up in Newark, off Clinton Ave. My grandmother's house was the center of everything. The neighborhood taught me loyalty and resilience, even when things were hard.",
    },
    {
      emoji:"🗺️", title:"Places I Love", color:C.gold,
      why: "Anchor points. Places with emotional safety are important self-regulation tools. Identifying them is clinically valuable.",
      prompt: "What places bring you peace, comfort, or good memories? They don't have to be anywhere special — a park, a relative's porch, a barbershop, a church.",
      facilitatorTip: "Let patients list freely. Don't qualify what counts as a 'place.' A street corner, a bedroom, a relative's kitchen — all valid.",
      example: "Weequahic Park. My uncle's garage. The basketball court on Bergen Ave. The old barbershop where I used to go with my dad.",
    },
    {
      emoji:"⚓", title:"What Keeps Me Grounded", color:C.emerald,
      why: "Identifies protective factors and coping anchors the patient already has — often untapped or forgotten during treatment.",
      prompt: "What people, places, memories, or activities remind you who you are? What brings you back to yourself when things get hard?",
      facilitatorTip: "This is often the most emotionally rich section. Give patients space. If they get quiet, that's okay — let them sit with it.",
      example: "My daughter's laugh. Old-school hip hop. Working out. The smell of my mom's cooking. Knowing my kids are watching how I handle this.",
    },
    {
      emoji:"🎯", title:"Hobbies & Interests", color:C.gold,
      why: "Rebuilding the life that was lost means reconnecting with what was enjoyable. This section normalizes the patient as a full person.",
      prompt: "What do you enjoy? What did you love before things got hard? What activities make you feel like yourself?",
      facilitatorTip: "Use the hobby tags in the app — they make this section feel low-pressure. Let patients tap through and find what resonates. Don't rush it.",
      example: "Music, basketball, cooking, cars. I used to draw when I was younger. I want to get back to that.",
    },
    {
      emoji:"🌱", title:"Recovery Journey", color:C.indigo,
      why: "Gives the patient ownership of their narrative — not the clinical version, but their version. Agency is protective.",
      prompt: "In your own words, how would you describe your journey? Not the clinical version — your version. What does life look like if things go the way you hope?",
      facilitatorTip: "Keep it future-oriented. If the patient focuses on the past, gently redirect: 'Tell me what the best version of the next year looks like for you.'",
      example: "I'm rebuilding trust with my kids. I've been through this before and I know what I need to do differently. This time, I have more support and more to fight for.",
    },
    {
      emoji:"🚀", title:"Goals & Motivation", color:C.emerald,
      why: "Goals create forward motion. Knowing what they're working toward reduces hopelessness — a leading predictor of relapse.",
      prompt: "What are you building toward? Who or what motivates you to keep going? What does success actually look like for you?",
      facilitatorTip: "Be concrete. 'Staying sober' is not enough — push for specifics. What do they want their daily life to look like in 6 months? What job? What relationship? What routine?",
      example: "Get my CDL license. Have my own apartment by fall. See my kids every weekend. Build something I can be proud of.",
    },
  ];

  return (
    <div>
      <p style={{ fontSize:13, color:C.muted, marginBottom:16, lineHeight:1.6 }}>
        A section-by-section guide for facilitating profile completion — including why each section matters clinically, the exact prompt to use, facilitation tips, and a sample answer.
      </p>
      {sections.map(s=>(
        <Accordion key={s.title} emoji={s.emoji} title={s.title} color={s.color}>
          <div style={{ marginTop:14 }}>
            <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
              <SLabel color={s.color}>Why This Matters</SLabel>
              <p style={{ fontSize:14, color:C.slate, lineHeight:1.65 }}>{s.why}</p>
            </div>
            <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
              <SLabel>Reflection Prompt to Read Aloud</SLabel>
              <p style={{ fontSize:15, color:"#fff", lineHeight:1.65, fontStyle:"italic" }}>"{s.prompt}"</p>
            </div>
            <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
              <SLabel>Facilitator Tip</SLabel>
              <p style={{ fontSize:14, color:C.slate, lineHeight:1.65 }}>{s.facilitatorTip}</p>
            </div>
            <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:12, padding:"12px 14px" }}>
              <SLabel>Sample Answer (share if patients get stuck)</SLabel>
              <p style={{ fontSize:14, color:C.muted, lineHeight:1.65, fontStyle:"italic" }}>"{s.example}"</p>
            </div>
          </div>
        </Accordion>
      ))}
    </div>
  );
}

// ── TAB: TALKING POINTS ───────────────────────────────────────
function TalkingPointsTab() {
  const groups = [
    {
      title: "Positioning the App",
      color: C.teal,
      points: [
        "\"This app is here as a tool — not a punishment, not surveillance, not a requirement.\"",
        "\"You may or may not use it later. That's your choice. But we want you to leave with every possible support already in your hands.\"",
        "\"The goal is to help you stay connected to structure, resources, and the person you're trying to become.\"",
        "\"Think of it as a support system that doesn't need an appointment and never closes.\"",
        "\"No one at this facility monitors your app activity. It belongs to you.\"",
      ],
    },
    {
      title: "On Identity & Profile",
      color: C.gold,
      points: [
        "\"This is not about judging your past. It is about helping you remember who you are, what matters to you, and what you want to build when you leave here.\"",
        "\"You are more than your addiction. Your roots, your personality, what you love — all of that matters and belongs in this profile.\"",
        "\"The more personal this profile is, the more useful the app becomes. It should feel like yours.\"",
        "\"You're not filling out a form. You're introducing yourself to a tool that's going to show up for you.\"",
      ],
    },
    {
      title: "On Daily Check-Ins",
      color: C.emerald,
      points: [
        "\"The check-in takes less than two minutes. It's not a test. There are no wrong answers.\"",
        "\"Over time, it creates a picture of your recovery — your mood trends, how often you're going to meetings, whether you're staying connected. That picture can save your life.\"",
        "\"You don't have to understand why it helps right now. Just try it every day for two weeks and see what you notice.\"",
        "\"If you have a bad day, the check-in is not a place to perform. It's a place to be honest.\"",
      ],
    },
    {
      title: "On Resources & Help",
      color: C.indigo,
      points: [
        "\"Everything you might need in the real world is in this app — housing, jobs, food, legal help, benefits. We're going to look at it now so you already know where to go.\"",
        "\"You don't have to figure this out alone. The app can help you find what you need, wherever you end up.\"",
        "\"Save the resources that matter to you right now. That way they're there when you need them, not when you're trying to remember the name of a program.\"",
      ],
    },
    {
      title: "On Community & Connection",
      color: "#A78BFA",
      points: [
        "\"The community section is a place where real people in recovery share real moments — wins, questions, encouragement. Everyone can post anonymously.\"",
        "\"It's not social media for likes. It's a space to be honest and to be reminded that you're not alone in this.\"",
        "\"Isolation is one of the most powerful triggers there is. This community is a small antidote to that.\"",
      ],
    },
    {
      title: "Closing the Session",
      color: C.emerald,
      points: [
        "\"You've worked hard to get here. Now we want to make sure you leave with more than a discharge summary.\"",
        "\"You're leaving with a tool that already knows your name, your story, and where to find help.\"",
        "\"This isn't a replacement for your sponsor, your counselor, or your support system. It's an addition to it.\"",
        "\"The decision to use it is yours. But the opportunity is already in your hands.\"",
      ],
    },
  ];

  return (
    <div>
      <p style={{ fontSize:13, color:C.muted, marginBottom:16, lineHeight:1.6 }}>
        Ready-to-use talking points for every part of the introduction. Read directly, paraphrase, or adapt to your natural style.
      </p>
      {groups.map(g=>(
        <Card key={g.title}>
          <p style={{ fontSize:15, fontWeight:800, color:g.color, marginBottom:14 }}>{g.title}</p>
          {g.points.map((p,i)=>(
            <div key={i} style={{ display:"flex", gap:10, marginBottom:i<g.points.length-1?12:0 }}>
              <span style={{ color:g.color, fontWeight:900, flexShrink:0, marginTop:2 }}>•</span>
              <p style={{ fontSize:14, color:C.slate, lineHeight:1.65, fontStyle:"italic" }}>{p}</p>
            </div>
          ))}
        </Card>
      ))}
    </div>
  );
}

// ── TAB: CHECKLIST ────────────────────────────────────────────
const CHECKLIST_ITEMS = [
  { group:"Account Setup", items:[
    "Patient has downloaded the app on their phone",
    "Patient has created an account and can log in",
    "Patient has seen the home dashboard",
  ]},
  { group:"Profile Completion", items:[
    "About Me section completed",
    "Hometown or roots section filled in",
    "At least one hobby or interest added",
    "What Keeps Me Grounded section completed",
    "Goals & Motivation section completed",
    "Profile completion is above 60%",
  ]},
  { group:"Features Demonstrated", items:[
    "Daily check-in demonstrated (at least one completed together)",
    "Resources section explored (housing, jobs, or benefits)",
    "At least one resource saved or noted as relevant",
    "Community / Voices of Recovery section shown",
  ]},
  { group:"Readiness", items:[
    "Patient knows the app is private — not monitored by the facility",
    "Patient knows where to find help in the app",
    "Patient understands the check-in is optional but encouraged",
    "Patient leaves feeling the app is personal to them",
    "Patient knows the app is a tool, not a requirement",
  ]},
];

function ChecklistTab() {
  const all = CHECKLIST_ITEMS.flatMap(g=>g.items);
  const [checks, setChecks] = useState({});
  const toggle = (key) => setChecks(c=>({ ...c, [key]: !c[key] }));
  const total = all.length;
  const done = Object.values(checks).filter(Boolean).length;
  const pct = Math.round((done/total)*100);

  return (
    <div>
      {/* Progress */}
      <Card style={{ background:"rgba(62,207,191,0.05)", borderColor:"rgba(62,207,191,0.2)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
          <p style={{ fontSize:16, fontWeight:800, color:"#fff" }}>Discharge Readiness</p>
          <p style={{ fontSize:26, fontWeight:900, color:C.teal }}>{pct}%</p>
        </div>
        <div style={{ background:"rgba(255,255,255,0.07)", borderRadius:6, height:7, overflow:"hidden", marginBottom:8 }}>
          <div style={{ height:"100%", borderRadius:6, width:`${pct}%`,
            background:`linear-gradient(90deg,${C.teal},#2CB8AE)`, transition:"width 0.4s ease" }}/>
        </div>
        <p style={{ fontSize:12, color:C.muted }}>{done} of {total} items completed</p>
      </Card>

      {/* Checklist by group */}
      {CHECKLIST_ITEMS.map(group=>(
        <Card key={group.group}>
          <p style={{ fontSize:14, fontWeight:800, color:"#fff", marginBottom:14 }}>{group.group}</p>
          {group.items.map((item,i)=>{
            const key = item;
            return (
              <button key={i} onClick={()=>toggle(key)}
                style={{ width:"100%", background:"none", border:"none", padding:"10px 0", cursor:"pointer",
                  display:"flex", alignItems:"flex-start", gap:12, textAlign:"left",
                  borderBottom: i<group.items.length-1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <div style={{ width:22, height:22, borderRadius:"50%", flexShrink:0, marginTop:1,
                  background: checks[key] ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)",
                  border:`1.5px solid ${checks[key] ? C.emerald : "rgba(255,255,255,0.15)"}`,
                  display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {checks[key] && <CheckCircle2 style={{ width:13, height:13, color:C.emerald }}/>}
                </div>
                <p style={{ fontSize:14, color: checks[key] ? C.emerald : C.slate, lineHeight:1.5,
                  textDecoration: checks[key] ? "line-through" : "none" }}>
                  {item}
                </p>
              </button>
            );
          })}
        </Card>
      ))}

      {done === total && (
        <div style={{ background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.25)",
          borderRadius:16, padding:"20px 18px", textAlign:"center" }}>
          <p style={{ fontSize:22, marginBottom:8 }}>🎉</p>
          <p style={{ fontSize:16, fontWeight:800, color:C.emerald }}>Patient is discharge-ready!</p>
          <p style={{ fontSize:13, color:C.slate, marginTop:6, lineHeight:1.6 }}>
            They're leaving with a real, personal aftercare tool already introduced and set up.
          </p>
        </div>
      )}
    </div>
  );
}

// ── ROOT COMPONENT ────────────────────────────────────────────
const TABS = [
  { id:"overview",   label:"Overview",      icon:BookOpen    },
  { id:"lessons",    label:"Lesson Plans",  icon:Users       },
  { id:"profile",    label:"Profile Guide", icon:User        },
  { id:"talking",    label:"Scripts",       icon:MessageSquare },
  { id:"checklist",  label:"Checklist",     icon:CheckCircle2  },
];

export default function CounselorGuide() {
  const [tab, setTab] = useState("overview");

  return (
    <div style={{ background:`linear-gradient(170deg,#070D1C 0%,#0B1424 60%,#080E1C 100%)`, minHeight:"100vh", paddingBottom:40 }}>
      <div style={{ maxWidth:480, margin:"0 auto" }}>

        {/* ── Header ──────────────────────────────────────────── */}
        <div style={{ position:"relative", overflow:"hidden", background:"linear-gradient(155deg,#0E1D3A 0%,#081426 100%)",
          padding:"64px 24px 28px", marginBottom:0 }}>
          <div style={{ position:"absolute", top:-60, right:-60, width:280, height:280, borderRadius:"50%",
            background:"radial-gradient(circle,rgba(62,207,191,0.08) 0%,transparent 70%)", pointerEvents:"none" }}/>
          <div style={{ position:"relative", zIndex:1 }}>
            <Link to={createPageUrl("Profile")} style={{ textDecoration:"none", display:"inline-flex", alignItems:"center", gap:6, marginBottom:20 }}>
              <ArrowLeft style={{ width:16, height:16, color:C.teal }}/><span style={{ fontSize:13, color:C.teal, fontWeight:700 }}>Back to Profile</span>
            </Link>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
              <div style={{ width:44, height:44, borderRadius:14, background:"rgba(62,207,191,0.12)",
                display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Smartphone style={{ width:22, height:22, color:C.teal }}/>
              </div>
              <div>
                <p style={{ fontSize:11, fontWeight:700, color:C.teal, textTransform:"uppercase", letterSpacing:".1em" }}>For Counselors & Facilities</p>
                <h1 style={{ fontSize:22, fontWeight:900, color:"#fff", lineHeight:1.2 }}>Aftercare App Onboarding Guide</h1>
              </div>
            </div>
            <p style={{ fontSize:14, color:C.slate, lineHeight:1.6 }}>
              A complete guide for introducing Unbound to patients during treatment — with lesson plans, scripts, profile prompts, and a discharge checklist.
            </p>
          </div>
        </div>

        {/* ── Tab navigation ──────────────────────────────────── */}
        <div style={{ overflowX:"auto", scrollbarWidth:"none", background:"rgba(255,255,255,0.03)",
          borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display:"flex", minWidth:"max-content", padding:"0 12px" }}>
            {TABS.map(t=>{
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={()=>setTab(t.id)} style={{
                  display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                  padding:"14px 14px 12px", border:"none", cursor:"pointer",
                  background:"transparent",
                  borderBottom: active ? `2px solid ${C.teal}` : "2px solid transparent",
                  color: active ? C.teal : C.muted, transition:"color 0.15s",
                }}>
                  <Icon style={{ width:16, height:16 }}/>
                  <span style={{ fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Tab content ─────────────────────────────────────── */}
        <div style={{ padding:"20px 16px" }}>
          {tab === "overview"  && <OverviewTab/>}
          {tab === "lessons"   && <LessonsTab/>}
          {tab === "profile"   && <ProfileTab/>}
          {tab === "talking"   && <TalkingPointsTab/>}
          {tab === "checklist" && <ChecklistTab/>}
        </div>

      </div>
    </div>
  );
}