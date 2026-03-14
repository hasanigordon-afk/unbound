import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Loader2, ChevronLeft, ChevronRight, CheckCircle2, Save } from "lucide-react";

const C = {
  teal:    "#3ECFBF",
  gold:    "#C9A96E",
  navy:    "#0B1220",
  emerald: "#10B981",
  indigo:  "#5B6EF5",
  slate:   "rgba(255,255,255,0.60)",
  muted:   "rgba(255,255,255,0.30)",
};

const HOBBY_TAGS = [
  "Music","Reading","Cooking","Fitness","Art","Sports","Gaming","Fishing","Gardening",
  "Basketball","Football","Soccer","Boxing","Running","Yoga","Meditation","Writing",
  "Photography","Fashion","Movies","Faith","Cars","Dancing","Poetry","Volunteering","Chess"
];

const STEPS = [
  {
    id: "intro",
    title: "Your Profile Is More Than a Form",
    subtitle: "It's a reflection of who you really are.",
    color: C.teal,
    emoji: "🌟",
    counselorNote: "Tell patients: \"This isn't about your struggles. It's about who you are, what matters to you, and what you want your life to look like. There are no wrong answers.\"",
    type: "intro",
  },
  {
    id: "bio",
    title: "About Me",
    subtitle: "Who are you beyond your struggles?",
    color: C.teal,
    emoji: "✍️",
    counselorNote: "Group prompt: \"If someone who didn't know your story met you today, what would you want them to know about you?\"",
    prompt: "What makes you, you? What do you want people to know about you beyond your challenges?",
    field: "bio",
    type: "textarea",
    placeholder: "I'm someone who loves music and family. I've always been creative and I care deeply about the people in my life…",
  },
  {
    id: "hometown",
    title: "Where I'm From",
    subtitle: "Your roots are part of your story.",
    color: "#A78BFA",
    emoji: "🌳",
    counselorNote: "Group prompt: \"Think about the places that shaped you. What neighborhood, city, or community helped make you who you are?\"",
    prompt: "Where did you grow up? What places helped shape who you are?",
    fields: [
      { key:"hometown", label:"Hometown or City", placeholder:"Newark, NJ / Chicago's South Side / rural Mississippi…", type:"text" },
      { key:"roots_story", label:"What shaped you there?", placeholder:"Growing up on my block, my grandmother's house on Elm Street, summers at the park…", type:"textarea" },
    ],
    type: "multi_field",
  },
  {
    id: "places",
    title: "Places I Love",
    subtitle: "Places that bring you peace, comfort, or good memories.",
    color: C.gold,
    emoji: "🗺️",
    counselorNote: "Group prompt: \"Think of a place — it doesn't have to be fancy — that makes you feel safe, comfortable, or like yourself. A park, a diner, someone's porch, a court, a church. What places feel like home to you?\"",
    prompt: "What places bring you peace, comfort, or good memories?",
    field: "places_i_love",
    type: "places",
    placeholder: "e.g. Weequahic Park, Grandma's kitchen, the old barbershop on Clinton Ave…",
  },
  {
    id: "grounding",
    title: "What Keeps Me Grounded",
    subtitle: "The people, places & things that bring you back to yourself.",
    color: C.emerald,
    emoji: "⚓",
    counselorNote: "Group prompt: \"When life gets hard, what reminds you who you are? It could be a person, a song, a smell, a routine — anything that brings you back to yourself.\"",
    prompt: "What people, places, memories, or activities remind you who you are?",
    field: "grounding_things",
    type: "textarea",
    placeholder: "My daughter's voice. The smell of my mom's cooking. Old-school hip hop. Working out in the morning…",
  },
  {
    id: "hobbies",
    title: "What I Enjoy",
    subtitle: "What do you love? What did you love before life got hard?",
    color: C.gold,
    emoji: "🎯",
    counselorNote: "Group prompt: \"What did you used to love doing before everything got complicated? What activities feel like the real you?\"",
    prompt: "Select everything that resonates — or add your own.",
    field: "hobbies",
    type: "hobbies",
    extras: [
      { key:"music_i_love", label:"Music I love", placeholder:"Hip hop, gospel, jazz, R&B…" },
      { key:"food_i_love",  label:"Food I love",  placeholder:"Soul food, my grandma's rice, pizza, tacos…" },
    ],
  },
  {
    id: "memories",
    title: "Good Energy",
    subtitle: "Memories and moments that feel like the real you.",
    color: "#F59E0B",
    emoji: "💛",
    counselorNote: "Group prompt: \"Think of a memory — something from before things got hard — that still makes you smile or feel warm inside. What was happening? Who was there? What did it feel like?\"",
    prompt: "What memories, traditions, or moments still feel pure and real? What brings you back to joy?",
    field: "core_memories",
    type: "textarea",
    placeholder: "Sundays at my grandmother's. Playing basketball at the park as a kid. My first job. Holding my baby for the first time…",
  },
  {
    id: "journey",
    title: "My Journey",
    subtitle: "What are you rebuilding? What does success look like after this?",
    color: C.indigo,
    emoji: "🌱",
    counselorNote: "One-on-one prompt: \"Describe your journey in your own words — not the clinical version, your version. What does life look like if everything goes the way you hope?\"",
    fields: [
      { key:"recovery_stage_label", label:"How would you describe your journey?", placeholder:"I'm rebuilding my relationship with my kids and finding stable ground…", type:"textarea" },
      { key:"sobriety_date", label:"My clean/sober date (optional)", placeholder:"", type:"date" },
    ],
    type: "multi_field",
  },
  {
    id: "building",
    title: "What I'm Building",
    subtitle: "Your goals, your dreams, your motivation.",
    color: C.emerald,
    emoji: "🚀",
    counselorNote: "Group prompt: \"If someone asked you what you were working toward — not just staying clean, but your actual life goals — what would you say? What does the next chapter look like?\"",
    fields: [
      { key:"what_im_building", label:"Right now I'm working on…",  placeholder:"Getting my license back, finding steady work, reconnecting with my family…", type:"textarea" },
      { key:"long_term_dream",  label:"My long-term dream",          placeholder:"Own my own business, move into my own place, see my kids every day…", type:"text" },
      { key:"motivation",       label:"What keeps me going",         placeholder:"My kids. The chance to prove I can do this. The version of myself I know exists…", type:"textarea" },
    ],
    type: "multi_field",
  },
  {
    id: "done",
    title: "Your Profile Is Set",
    subtitle: "You just did something meaningful.",
    color: C.emerald,
    emoji: "🎉",
    counselorNote: "Tell patients: \"What you just filled out is yours. This app is here whenever you need it — whether you're having a good day or a hard one. You've already taken a real step today.\"",
    type: "done",
  },
];

function Textarea({ value, onChange, placeholder, rows=4 }) {
  return (
    <textarea value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width:"100%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.14)",
        borderRadius:14, padding:"14px 16px", fontSize:15, color:"#fff", resize:"vertical",
        outline:"none", fontFamily:"inherit", boxSizing:"border-box", lineHeight:1.6 }}/>
  );
}

function TextInput({ value, onChange, placeholder, type="text" }) {
  return (
    <input type={type} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{ width:"100%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.14)",
        borderRadius:14, padding:"14px 16px", fontSize:15, color:"#fff", outline:"none", boxSizing:"border-box" }}/>
  );
}

export default function GuidedProfileSetup() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [stepIdx, setStepIdx] = useState(0);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [placeInput, setPlaceInput] = useState("");
  const [showCounselorNote, setShowCounselorNote] = useState(false);

  const { data: user } = useQuery({ queryKey:["user"], queryFn:() => base44.auth.me() });
  const { data: profiles } = useQuery({
    queryKey:["my-profile", user?.email],
    queryFn: () => base44.entities.MemberProfile.filter({ created_by: user.email }),
    enabled: !!user?.email,
    onSuccess: (data) => { if (data?.[0]) setForm({ ...data[0] }); },
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const p = profiles?.[0];
      if (p?.id) return base44.entities.MemberProfile.update(p.id, data);
    },
    onSuccess: () => queryClient.invalidateQueries(["my-profile"]),
  });

  const step = STEPS[stepIdx];
  const progress = Math.round((stepIdx / (STEPS.length - 1)) * 100);
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    await saveMutation.mutateAsync(form);
    setSaving(false);
  };

  const handleNext = async () => {
    await handleSave();
    if (stepIdx < STEPS.length - 1) setStepIdx(s => s + 1);
  };

  const handleBack = () => {
    if (stepIdx > 0) setStepIdx(s => s - 1);
  };

  const addPlace = () => {
    if (!placeInput.trim()) return;
    set("places_i_love", [...(form.places_i_love||[]), placeInput.trim()]);
    setPlaceInput("");
  };

  const toggleHobby = (h) => {
    const cur = form.hobbies || [];
    set("hobbies", cur.includes(h) ? cur.filter(x=>x!==h) : [...cur, h]);
  };

  return (
    <div style={{ background:`linear-gradient(170deg,#070D1C 0%,#0B1424 60%,#080E1C 100%)`, minHeight:"100vh", paddingBottom:40 }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .step-in { animation: fadeUp 0.4s cubic-bezier(.22,1,.36,1) both; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.22); }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.6); }
      `}</style>

      <div style={{ maxWidth:480, margin:"0 auto", padding:"0 16px" }}>

        {/* ── Top bar ────────────────────────────────────────── */}
        <div style={{ padding:"20px 0 0", display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={handleBack} disabled={stepIdx===0}
            style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10,
              padding:"8px 10px", cursor:stepIdx===0?"not-allowed":"pointer", opacity:stepIdx===0?0.3:1, color:C.slate }}>
            <ChevronLeft style={{ width:18, height:18 }}/>
          </button>
          <div style={{ flex:1 }}>
            <div style={{ background:"rgba(255,255,255,0.07)", borderRadius:6, height:5, overflow:"hidden" }}>
              <div style={{ height:"100%", borderRadius:6, width:`${progress}%`,
                background:`linear-gradient(90deg,${C.teal},#2CB8AE)`, transition:"width 0.4s ease" }}/>
            </div>
            <p style={{ fontSize:11, color:C.muted, marginTop:5 }}>Step {stepIdx + 1} of {STEPS.length}</p>
          </div>
          <button onClick={() => { handleSave(); navigate(createPageUrl("Profile")); }}
            style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10,
              padding:"8px 12px", cursor:"pointer", color:C.muted, fontSize:12, fontWeight:600 }}>
            Save & Exit
          </button>
        </div>

        {/* ── Step card ──────────────────────────────────────── */}
        <div key={step.id} className="step-in" style={{ marginTop:24 }}>

          {/* Header */}
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <div style={{ fontSize:48, marginBottom:12 }}>{step.emoji}</div>
            <h2 style={{ fontSize:26, fontWeight:900, color:"#fff", lineHeight:1.2, marginBottom:8 }}>{step.title}</h2>
            <p style={{ fontSize:15, color:C.slate, lineHeight:1.6 }}>{step.subtitle}</p>
          </div>

          {/* Counselor note toggle */}
          <button onClick={() => setShowCounselorNote(s=>!s)}
            style={{ width:"100%", background:"rgba(201,169,110,0.07)", border:"1px solid rgba(201,169,110,0.2)",
              borderRadius:14, padding:"10px 16px", marginBottom:20, cursor:"pointer",
              display:"flex", alignItems:"center", gap:8, textAlign:"left" }}>
            <span style={{ fontSize:14 }}>👨‍🏫</span>
            <span style={{ fontSize:12, fontWeight:700, color:C.gold }}>Counselor / Facilitator Note</span>
            <span style={{ marginLeft:"auto", fontSize:11, color:C.muted }}>{showCounselorNote ? "▲ Hide" : "▼ Show"}</span>
          </button>
          {showCounselorNote && (
            <div style={{ background:"rgba(201,169,110,0.06)", border:"1px solid rgba(201,169,110,0.15)",
              borderRadius:14, padding:"14px 16px", marginBottom:20 }}>
              <p style={{ fontSize:14, color:"rgba(255,255,255,0.65)", lineHeight:1.65, fontStyle:"italic" }}>
                {step.counselorNote}
              </p>
            </div>
          )}

          {/* ── INTRO STEP ───────────────────────────────────── */}
          {step.type === "intro" && (
            <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:20, padding:"24px 20px" }}>
              {[
                { icon:"🧭", text:"Answer reflective questions at your own pace" },
                { icon:"💾", text:"Progress saves automatically as you go" },
                { icon:"🔒", text:"Your answers are private — only you can see them" },
                { icon:"⏸️", text:"You can save and continue at any time" },
                { icon:"✨", text:"This is about who you are, not just your struggles" },
              ].map((item,i) => (
                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:i<4?16:0 }}>
                  <span style={{ fontSize:20, flexShrink:0 }}>{item.icon}</span>
                  <p style={{ fontSize:15, color:C.slate, lineHeight:1.55 }}>{item.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── TEXTAREA STEP ────────────────────────────────── */}
          {step.type === "textarea" && (
            <div>
              <p style={{ fontSize:14, color:C.muted, marginBottom:12, lineHeight:1.6, fontStyle:"italic" }}>{step.prompt}</p>
              <Textarea value={form[step.field]} onChange={v=>set(step.field, v)} placeholder={step.placeholder} rows={5}/>
            </div>
          )}

          {/* ── MULTI FIELD STEP ─────────────────────────────── */}
          {step.type === "multi_field" && (
            <div>
              {step.prompt && <p style={{ fontSize:14, color:C.muted, marginBottom:16, fontStyle:"italic" }}>{step.prompt}</p>}
              {step.fields.map(f => (
                <div key={f.key} style={{ marginBottom:16 }}>
                  <p style={{ fontSize:12, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:".08em", marginBottom:8 }}>{f.label}</p>
                  {f.type === "textarea"
                    ? <Textarea value={form[f.key]} onChange={v=>set(f.key, v)} placeholder={f.placeholder} rows={3}/>
                    : <TextInput type={f.type} value={form[f.key]} onChange={v=>set(f.key, v)} placeholder={f.placeholder}/>
                  }
                </div>
              ))}
            </div>
          )}

          {/* ── PLACES STEP ──────────────────────────────────── */}
          {step.type === "places" && (
            <div>
              <p style={{ fontSize:14, color:C.muted, marginBottom:16, fontStyle:"italic", lineHeight:1.6 }}>{step.prompt}</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:14 }}>
                {(form.places_i_love||[]).map((p,i) => (
                  <span key={i} style={{ background:"rgba(62,207,191,0.1)", border:"1px solid rgba(62,207,191,0.25)",
                    borderRadius:20, padding:"7px 14px", fontSize:13, fontWeight:600, color:C.teal,
                    display:"flex", alignItems:"center", gap:6 }}>
                    📍 {p}
                    <button onClick={() => set("places_i_love", (form.places_i_love||[]).filter((_,idx)=>idx!==i))}
                      style={{ background:"none", border:"none", color:"rgba(62,207,191,0.5)", cursor:"pointer", padding:0, fontSize:14 }}>✕</button>
                  </span>
                ))}
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <input value={placeInput} onChange={e=>setPlaceInput(e.target.value)}
                  placeholder={step.placeholder}
                  onKeyDown={e=>e.key==="Enter" && addPlace()}
                  style={{ flex:1, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.14)",
                    borderRadius:14, padding:"13px 16px", fontSize:14, color:"#fff", outline:"none" }}/>
                <button onClick={addPlace} style={{ padding:"13px 18px", borderRadius:14,
                  background:`rgba(${62},${207},${191},0.15)`, border:`1px solid rgba(62,207,191,0.3)`,
                  color:C.teal, fontWeight:700, fontSize:14, cursor:"pointer" }}>
                  Add
                </button>
              </div>
            </div>
          )}

          {/* ── HOBBIES STEP ─────────────────────────────────── */}
          {step.type === "hobbies" && (
            <div>
              <p style={{ fontSize:14, color:C.muted, marginBottom:16, fontStyle:"italic" }}>{step.prompt}</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:20 }}>
                {HOBBY_TAGS.map(h => {
                  const on = (form.hobbies||[]).includes(h);
                  return (
                    <button key={h} onClick={()=>toggleHobby(h)} style={{
                      padding:"8px 16px", borderRadius:20, fontSize:13, fontWeight:700, cursor:"pointer", border:"1px solid",
                      background: on ? "rgba(201,169,110,0.15)" : "rgba(255,255,255,0.04)",
                      borderColor: on ? "rgba(201,169,110,0.5)" : "rgba(255,255,255,0.1)",
                      color: on ? C.gold : "rgba(255,255,255,0.45)",
                    }}>{h}</button>
                  );
                })}
              </div>
              {step.extras.map(ex => (
                <div key={ex.key} style={{ marginBottom:14 }}>
                  <p style={{ fontSize:12, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:".07em", marginBottom:8 }}>{ex.label}</p>
                  <TextInput value={form[ex.key]} onChange={v=>set(ex.key, v)} placeholder={ex.placeholder}/>
                </div>
              ))}
            </div>
          )}

          {/* ── DONE STEP ────────────────────────────────────── */}
          {step.type === "done" && (
            <div>
              <div style={{ background:"rgba(16,185,129,0.07)", border:"1px solid rgba(16,185,129,0.2)",
                borderRadius:20, padding:"24px 20px", marginBottom:16 }}>
                {[
                  "Your profile reflects who you really are",
                  "You've taken a meaningful step in your transition",
                  "This app is here for you whenever you need it",
                  "Your story, your identity, your future — all here",
                ].map((t,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:i<3?14:0 }}>
                    <CheckCircle2 style={{ width:18, height:18, color:C.emerald, flexShrink:0 }}/>
                    <p style={{ fontSize:14, color:C.slate }}>{t}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate(createPageUrl("Profile"))} style={{
                width:"100%", padding:"16px", borderRadius:16, marginBottom:10,
                background:`linear-gradient(135deg,${C.teal},#2CB8AE)`,
                border:"none", color:"#fff", fontWeight:800, fontSize:16, cursor:"pointer",
                boxShadow:"0 8px 28px rgba(62,207,191,0.28)",
              }}>
                View My Full Profile →
              </button>
              <button onClick={() => navigate(createPageUrl("Home"))} style={{
                width:"100%", padding:"14px", borderRadius:16,
                background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
                color:C.slate, fontWeight:700, fontSize:15, cursor:"pointer",
              }}>
                Go to My Home Dashboard
              </button>
            </div>
          )}

        </div>

        {/* ── Bottom nav ─────────────────────────────────────── */}
        {step.type !== "done" && (
          <div style={{ marginTop:28 }}>
            <button onClick={handleNext} disabled={saving}
              style={{ width:"100%", padding:"16px", borderRadius:16,
                background:`linear-gradient(135deg,${step.color === C.teal ? C.teal : step.color},${step.color}CC)`,
                border:"none", color:"#fff", fontWeight:800, fontSize:16, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                boxShadow:`0 6px 24px ${step.color}30`,
              }}>
              {saving ? <Loader2 className="w-5 h-5 animate-spin"/> : (
                <>{stepIdx === STEPS.length - 2 ? "Complete My Profile ✓" : "Continue"} <ChevronRight style={{ width:18, height:18 }}/></>
              )}
            </button>
            <p style={{ textAlign:"center", fontSize:12, color:C.muted, marginTop:12 }}>
              <button onClick={() => { handleSave(); navigate(createPageUrl("Profile")); }}
                style={{ background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:12, textDecoration:"underline" }}>
                Save progress and continue later
              </button>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}