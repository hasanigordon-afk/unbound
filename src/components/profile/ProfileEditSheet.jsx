import React, { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";

const HOBBY_TAGS = [
  "Music","Reading","Cooking","Fitness","Art","Sports","Gaming","Fishing","Gardening",
  "Basketball","Football","Soccer","Boxing","Running","Yoga","Meditation","Writing",
  "Photography","Fashion","Movies","Travel","Family","Faith","Cars","Barbershop",
  "Dancing","Poetry","Comedy","Woodworking","Animals","Volunteering","Chess"
];

const field = (label, key, val, onChange, type="text", placeholder="") => (
  <div key={key} style={{ marginBottom:20 }}>
    <label style={{ display:"block", fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:8 }}>{label}</label>
    {type === "textarea" ? (
      <textarea value={val||""} onChange={e=>onChange(key,e.target.value)} placeholder={placeholder} rows={3}
        style={{ width:"100%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:12,
          padding:"12px 14px", fontSize:14, color:"#fff", resize:"vertical", outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
    ) : (
      <input type={type} value={val||""} onChange={e=>onChange(key,e.target.value)} placeholder={placeholder}
        style={{ width:"100%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:12,
          padding:"12px 14px", fontSize:14, color:"#fff", outline:"none", boxSizing:"border-box" }}/>
    )}
  </div>
);

export default function ProfileEditSheet({ profile, onSave, onClose }) {
  const [form, setForm] = useState({ ...profile });
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const toggleHobby = (h) => {
    const cur = form.hobbies || [];
    set("hobbies", cur.includes(h) ? cur.filter(x=>x!==h) : [...cur, h]);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  };

  const addPlace = () => {
    const p = prompt("Add a place (e.g. Weequahic Park, the old barbershop on Clinton Ave):");
    if (p?.trim()) set("places_i_love", [...(form.places_i_love||[]), p.trim()]);
  };
  const removePlace = (i) => set("places_i_love", (form.places_i_love||[]).filter((_,idx)=>idx!==i));

  return (
    <div style={{ position:"fixed", inset:0, zIndex:100, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(6px)", WebkitBackdropFilter:"blur(6px)", overflowY:"auto" }}>
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
        <div style={{ width:"100%", maxWidth:480, background:"#0E1828", borderRadius:"28px 28px 0 0", padding:"28px 20px 48px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
            <p style={{ fontSize:18, fontWeight:800, color:"#fff" }}>Edit My Profile</p>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.08)", border:"none", borderRadius:10, padding:"8px", cursor:"pointer", color:"rgba(255,255,255,0.6)" }}>
              <X className="w-5 h-5"/>
            </button>
          </div>

          <Section title="Identity">
            {field("Personal Quote / Status Line","personal_quote",form.personal_quote,set,"text","e.g. Rebuilding one day at a time…")}
            {field("About Me","bio",form.bio,set,"textarea","What makes you, you? What do you want people to know about you beyond your struggles?")}
          </Section>

          <Section title="My Roots">
            {field("Hometown","hometown",form.hometown,set,"text","Where are you from?")}
            {field("What shaped you","roots_story",form.roots_story,set,"textarea","Neighborhoods, family, the city that raised you…")}
          </Section>

          <Section title="Places I Love">
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:10 }}>
              {(form.places_i_love||[]).map((p,i) => (
                <span key={i} style={{ background:"rgba(62,207,191,0.12)", color:"#3ECFBF", border:"1px solid rgba(62,207,191,0.25)",
                  borderRadius:20, padding:"6px 12px", fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:6 }}>
                  📍 {p}
                  <button onClick={()=>removePlace(i)} style={{ background:"none", border:"none", color:"rgba(62,207,191,0.6)", cursor:"pointer", padding:0, lineHeight:1 }}>✕</button>
                </span>
              ))}
              <button onClick={addPlace} style={{ background:"rgba(255,255,255,0.06)", border:"1px dashed rgba(255,255,255,0.2)",
                borderRadius:20, padding:"6px 14px", fontSize:13, color:"rgba(255,255,255,0.5)", cursor:"pointer" }}>+ Add Place</button>
            </div>
          </Section>

          <Section title="What Keeps Me Grounded">
            {field("People, places & things that bring you back to yourself","grounding_things",form.grounding_things,set,"textarea","Music, a person, a park, a tradition, a smell, a song…")}
          </Section>

          <Section title="Hobbies & Interests">
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:8 }}>
              {HOBBY_TAGS.map(h => {
                const on = (form.hobbies||[]).includes(h);
                return (
                  <button key={h} onClick={()=>toggleHobby(h)} style={{
                    padding:"7px 14px", borderRadius:20, fontSize:13, fontWeight:600, cursor:"pointer", border:"1px solid",
                    background: on ? "rgba(201,169,110,0.15)" : "rgba(255,255,255,0.04)",
                    borderColor: on ? "rgba(201,169,110,0.5)" : "rgba(255,255,255,0.12)",
                    color: on ? "#C9A96E" : "rgba(255,255,255,0.5)",
                  }}>{h}</button>
                );
              })}
            </div>
            {field("Music I love","music_i_love",form.music_i_love,set,"text","Hip hop, gospel, R&B, jazz…")}
            {field("Food I love","food_i_love",form.food_i_love,set,"text","Soul food, Puerto Rican, pizza, grandma's cooking…")}
          </Section>

          <Section title="Good Energy / Core Memories">
            {field("Memories, moments & things that feel like home","core_memories",form.core_memories,set,"textarea","What used to make you smile? What still feels pure and real?")}
          </Section>

          <Section title="My Journey (Optional)">
            {field("My clean/sober date","sobriety_date",form.sobriety_date,set,"date","")}
            {field("How I describe my journey","recovery_stage_label",form.recovery_stage_label,set,"text","In my own words…")}
          </Section>

          <Section title="What I'm Building">
            {field("Right now I'm working on…","what_im_building",form.what_im_building,set,"textarea","Short-term goals, what you're actively doing…")}
            {field("My long-term dream","long_term_dream",form.long_term_dream,set,"text","Where do you see yourself in 3–5 years?")}
            {field("What keeps me going","motivation",form.motivation,set,"textarea","Who or what motivates you to keep showing up?")}
          </Section>

          <button onClick={handleSave} disabled={saving} style={{
            width:"100%", padding:"16px", borderRadius:16,
            background:"linear-gradient(135deg,#3ECFBF,#2CB8AE)",
            border:"none", color:"#fff", fontWeight:800, fontSize:16, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            boxShadow:"0 8px 28px rgba(62,207,191,0.3)",
          }}>
            {saving ? <Loader2 className="w-5 h-5 animate-spin"/> : <><Save className="w-5 h-5"/> Save My Profile</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom:28 }}>
      <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:16 }}>{title}</p>
      {children}
    </div>
  );
}