import React, { useState } from "react";
import { X, BookOpen } from "lucide-react";

const ARTICLES = [
  {
    id: "cravings",
    title: "Understanding Cravings",
    tag: "Science",
    emoji: "🧠",
    readTime: "3 min",
    color: "#F97316",
    summary: "Cravings are normal brain signals — not moral failures.",
    content: `**What is a craving, really?**

A craving is your brain sending an urgent signal: "I remember feeling good from this. Do it again."

It's not weakness. It's chemistry. When you use substances repeatedly, your brain literally rewires itself to associate certain places, people, or feelings with relief. That wiring doesn't disappear overnight.

**The craving peak**

Most cravings peak at 15–30 minutes and then fade. That's it. You don't have to fix anything — you just have to get through a short window.

**What actually helps**

- Move your body. Walk, stretch, do push-ups. It disrupts the craving signal.
- Change your environment. If a craving hits in a certain place, leave.
- Surf the urge. Notice the craving without acting on it. It will pass.
- Tell someone. Cravings lose power when you name them out loud.

The more you ride out a craving without acting on it, the weaker that signal gets over time. You are literally rewiring your brain every time you hold on.`,
  },
  {
    id: "habits",
    title: "Rewiring Your Habits",
    tag: "Recovery",
    emoji: "🔄",
    readTime: "4 min",
    color: "#3ECFBF",
    summary: "Every new positive habit creates a new neural pathway.",
    content: `**Habits aren't willpower. They're loops.**

Every habit follows a three-step loop: Trigger → Routine → Reward. The old substance use loop got deeply grooved into your brain through repetition.

The good news? New loops can be built the same way.

**Start embarrassingly small**

Don't try to change everything at once. Pick one tiny behavior. Drink water every morning when you wake up. Walk to the mailbox. Write one sentence in a journal.

Small habits done consistently create the foundation for bigger ones.

**Stack habits**

Attach new habits to existing ones. After you brush your teeth (existing), you do 5 deep breaths (new). After you make coffee, you read one page.

**Replace, don't remove**

The brain doesn't erase habits — it replaces them. Find a new routine that gives you the same reward (relaxation, connection, escape) without the cost.

Recovery isn't about removing comfort. It's about finding better comfort.`,
  },
  {
    id: "triggers",
    title: "Dealing With Triggers",
    tag: "Tools",
    emoji: "⚡",
    readTime: "3 min",
    color: "#A78BFA",
    summary: "Know your triggers before they catch you off guard.",
    content: `**A trigger is just a reminder your brain stored**

A song, a smell, a neighborhood, a fight with a family member — any of these can trigger a craving because your brain stored a memory linking that thing to the feeling of using.

You didn't choose those associations. But you can choose what you do when they activate.

**Types of triggers**

- **Internal:** Stress, loneliness, boredom, anger, shame, exhaustion
- **External:** People, places, objects, times of day
- **Social:** Seeing friends who still use, parties, certain conversations

**Your trigger plan**

1. Write down your top 5 triggers.
2. For each one, decide in advance: what will you do when it hits?
3. Tell someone you trust what your triggers are.

**The H.A.L.T. check**

Before acting on a craving, ask: Am I Hungry? Angry? Lonely? Tired?

Most relapses happen when at least 2 of those boxes are checked. Address the need, not the craving.`,
  },
  {
    id: "emotions",
    title: "Emotional Control",
    tag: "Mental Health",
    emoji: "🌊",
    readTime: "4 min",
    color: "#60A5FA",
    summary: "Emotions are information, not commands.",
    content: `**You don't have to act on every feeling**

For many people in recovery, substances were the main way they managed feelings. When emotions become overwhelming, the trained response is: use.

Unlearning that takes time. But it starts with a simple idea: feelings are information, not commands.

**The 90-second rule**

Neuroscientist Dr. Jill Bolte Taylor discovered that an emotion, left alone, runs its biological course in about 90 seconds. After that, if the feeling continues, it's because your thoughts are keeping it alive.

That means: if you can pause for 90 seconds without acting out, the sharpest edge of most emotions will start to fade.

**Name it to tame it**

Research shows that when you label an emotion ("I feel anxious" or "I feel ashamed"), the emotional intensity actually decreases in the brain. Naming takes power from the feeling.

**Build a feeling vocabulary**

Most people learned 3 emotions: mad, sad, fine. The more precisely you can name what you feel, the better you can respond to it.`,
  },
  {
    id: "discipline",
    title: "Building Discipline",
    tag: "Growth",
    emoji: "💪",
    readTime: "2 min",
    color: "#C9A96E",
    summary: "Discipline is just commitment in action — one choice at a time.",
    content: `**Discipline isn't punishment — it's freedom**

Most people think discipline means grinding through things you hate. It doesn't. True discipline is being consistent enough with your choices that your life starts moving in a direction you actually want.

**You don't feel motivated first**

Motivation follows action, not the other way around. You don't wait to feel ready. You do the small thing. The feeling of progress comes after.

**Forget the streak, focus on the next choice**

One missed day isn't failure. Letting one missed day become a week — that's where discipline breaks down.

The most important thing is always the next single choice. Not your whole recovery. Not your whole life. The next five minutes.

**Your identity builds with each choice**

Every time you choose your values over your impulse, you're voting for the person you're becoming. Over time, those votes add up into someone you recognize as strong.

You are already that person. You just keep becoming them.`,
  },
  {
    id: "stories",
    title: "Real Recovery Stories",
    tag: "Inspiration",
    emoji: "✨",
    readTime: "5 min",
    color: "#F472B6",
    summary: "People just like you found a way through. Here are their words.",
    content: `**"I thought I was too far gone"**

Marcus, 38, spent 11 years in and out of treatment. He described himself as someone who'd "burned every bridge." Then one night, after his daughter stopped taking his calls, something shifted.

"I finally stopped trying to manage my addiction and just admitted I couldn't. That was the first time anything changed."

He's been sober 4 years. He coaches high school football now.

---

**"I didn't believe I deserved to get better"**

Tanya, 31, says shame was her biggest obstacle. "I kept relapsing because I secretly felt like I deserved to suffer. It took real therapy to get at that."

She eventually found a peer support group where she heard her story in other people's mouths. "That was when I stopped feeling like a freak."

Two years later, she became a certified peer support specialist.

---

**What they have in common**

Every person who finds sustained recovery shares a few things:

1. They accepted help from at least one other person.
2. They stopped trying to do it perfectly and just kept going.
3. They found something worth staying sober for.

You don't need to be ready. You just need to be willing.`,
  },
];

export default function MentalHealthReads() {
  const [reading, setReading] = useState(null);

  const article = reading ? ARTICLES.find(a => a.id === reading) : null;

  if (article) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <button onClick={() => setReading(null)} style={{
          display: "flex", alignItems: "center", gap: 8, background: "none", border: "none",
          cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 600,
          padding: "0 0 20px", marginLeft: -4,
        }}>
          ← Back
        </button>
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
            background: `${article.color}20`, color: article.color, marginBottom: 10, display: "inline-block" }}>
            {article.tag}
          </span>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 6 }}>
            {article.title}
          </h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{article.readTime} read</p>
        </div>
        <div style={{ lineHeight: 1.8 }}>
          {article.content.split("\n\n").map((para, i) => {
            if (para.startsWith("**") && para.endsWith("**")) {
              return <p key={i} style={{ fontSize: 16, fontWeight: 800, color: article.color,
                marginBottom: 10, marginTop: i > 0 ? 20 : 0 }}>{para.replace(/\*\*/g, "")}</p>;
            }
            if (para.startsWith("- ")) {
              const items = para.split("\n").filter(l => l.startsWith("- "));
              return <ul key={i} style={{ margin: "0 0 16px 0", paddingLeft: 20 }}>
                {items.map((item, j) => (
                  <li key={j} style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 6, lineHeight: 1.6 }}>
                    {item.replace(/^- /, "").replace(/\*\*(.*?)\*\*/g, "$1")}
                  </li>
                ))}
              </ul>;
            }
            if (para.startsWith("---")) {
              return <hr key={i} style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.08)", margin: "20px 0" }} />;
            }
            return (
              <p key={i} style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 16, lineHeight: 1.75 }}>
                {para.replace(/\*\*(.*?)\*\*/g, (_, b) => b)}
              </p>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
        letterSpacing: "1px", marginBottom: 14 }}>Mental Health Library</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {ARTICLES.map(a => (
          <button key={a.id} onClick={() => setReading(a.id)} style={{
            display: "flex", alignItems: "center", gap: 14, padding: "16px",
            borderRadius: 18, background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer", textAlign: "left",
          }}>
            <span style={{ fontSize: 30, flexShrink: 0 }}>{a.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{a.title}</p>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                  background: `${a.color}20`, color: a.color }}>{a.tag}</span>
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>{a.summary}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>📖 {a.readTime}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}