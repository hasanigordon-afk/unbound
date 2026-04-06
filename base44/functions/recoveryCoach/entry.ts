import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

  // Fetch all relevant data in parallel
  const [reflections, completions, tasks, checkIns] = await Promise.all([
    base44.entities.RecoveryPathReflection.filter({ user_email: user.email }, '-reflection_date', 14),
    base44.entities.RecoveryPathCompletion.filter({ user_email: user.email }, '-completion_date', 100),
    base44.entities.RecoveryPathTask.filter({ user_email: user.email, is_active: true }),
    base44.entities.DailyCheckIn.filter({ participant_email: user.email }, '-check_in_date', 30),
  ]);

  // Compute task completion patterns
  const recentCompletions = completions.filter(c => c.completion_date >= sevenDaysAgo);
  const doneCount   = recentCompletions.filter(c => c.status === 'done').length;
  const skippedCount = recentCompletions.filter(c => c.status === 'skipped').length;
  const skipReasons = recentCompletions
    .filter(c => c.skip_reason)
    .map(c => c.skip_reason);

  // Category breakdown
  const catCounts = {};
  recentCompletions.filter(c => c.status === 'done').forEach(c => {
    catCounts[c.task_category] = (catCounts[c.task_category] || 0) + 1;
  });

  // Skipped categories
  const skippedCats = {};
  recentCompletions.filter(c => c.status === 'skipped').forEach(c => {
    skippedCats[c.task_category] = (skippedCats[c.task_category] || 0) + 1;
  });

  // Recent reflection summaries
  const recentReflections = reflections.slice(0, 7).map(r => ({
    date: r.reflection_date,
    went_well: r.went_well || '',
    challenged: r.challenged_you || '',
    improve: r.improve_tomorrow || '',
    mood: r.mood,
    effort: r.effort_level,
  }));

  // Craving & mood from daily check-ins
  const recentCheckIns = checkIns.slice(0, 14);
  const avgCraving = recentCheckIns.length
    ? (recentCheckIns.reduce((s, c) => s + (c.craving_intensity ?? 5), 0) / recentCheckIns.length).toFixed(1)
    : null;
  const triggers = recentCheckIns
    .filter(c => c.craving_triggers)
    .flatMap(c => Array.isArray(c.craving_triggers) ? c.craving_triggers : [c.craving_triggers])
    .slice(0, 10);

  // Weekly tasks planned
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const todayDow = new Date().getDay();
  const upcomingTasks = tasks.map(t => ({
    title: t.title,
    category: t.category,
    days: (t.days_of_week || []).map(d => dayNames[d]).join(', '),
    priority: t.priority,
  }));

  // Streak
  const doneDates = [...new Set(completions.filter(c => c.status === 'done').map(c => c.completion_date))].sort().reverse();
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    if (doneDates.includes(ds)) streak++;
    else if (i > 0) break;
  }

  const prompt = `You are a warm, empathetic Recovery Coach AI. You support people in recovery and anyone rebuilding their life. 
Your tone is calm, gentle, honest, and encouraging — never preachy, never shame-based. You speak like a trusted mentor.

Today is ${today}. The user's name is ${user.full_name || 'Friend'}.

RECENT REFLECTION ENTRIES (last 7 days):
${recentReflections.length > 0
  ? recentReflections.map(r =>
    `Date: ${r.date} | Mood: ${r.mood}/5 | Effort: ${r.effort}/5
    What went well: ${r.went_well || 'not noted'}
    What challenged them: ${r.challenged || 'not noted'}
    Want to improve: ${r.improve || 'not noted'}`
  ).join('\n\n')
  : 'No reflections yet.'}

TASK COMPLETION STATS (last 7 days):
- Tasks completed: ${doneCount}
- Tasks skipped: ${skippedCount}
- Current streak: ${streak} days
- Most completed category: ${Object.entries(catCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'none'}
- Most skipped category: ${Object.entries(skippedCats).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'none'}
- Skip reasons mentioned: ${skipReasons.length > 0 ? skipReasons.join(', ') : 'none'}

RECOVERY CHECK-IN DATA:
- Average craving intensity (14 days): ${avgCraving || 'no data'}/10
- Identified triggers: ${triggers.length > 0 ? triggers.join(', ') : 'none logged'}

UPCOMING WEEKLY PLAN:
${upcomingTasks.length > 0
  ? upcomingTasks.map(t => `• [${t.priority}] ${t.title} (${t.category}) — ${t.days}`).join('\n')
  : 'No tasks planned yet.'}

Based on all of this data, generate a personalized coaching response with exactly these three sections:

1. MORNING ENCOURAGEMENT (2-4 sentences): A warm, specific morning message that acknowledges their actual patterns — celebrate what's going well, gently acknowledge struggles without judgment. Reference real things from their data if possible.

2. WEEKLY PLAN SUGGESTIONS (3-5 bullet points): Specific, gentle suggestions to adjust their upcoming week based on patterns. If they're skipping certain categories, suggest lighter versions or re-timing. If cravings are high, suggest adding a coping routine. If they're excelling, suggest a small growth challenge. Be practical.

3. COPING STRATEGIES (3-4 bullet points): Based on their identified triggers, craving data, and reflection challenges, suggest specific, actionable coping strategies. Each strategy should be concrete and doable — not generic. If triggers are known, address them directly.

Keep the total response warm and personal. Avoid clinical language. Never shame. Never say "you should". Use phrases like "consider", "you might try", "one thing that could help", "when that happens". Format your response in clean JSON.`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        morning_encouragement: { type: 'string' },
        weekly_suggestions: { type: 'array', items: { type: 'string' } },
        coping_strategies:  { type: 'array', items: { type: 'string' } },
        generated_at:       { type: 'string' },
      }
    }
  });

  return Response.json({
    ...result,
    generated_at: today,
    streak,
    avg_craving: avgCraving,
    data_summary: { doneCount, skippedCount, reflectionCount: recentReflections.length },
  });
});