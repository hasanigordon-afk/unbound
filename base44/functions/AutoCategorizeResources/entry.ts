import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const KEYWORD_RULES = [
  { keyword: "shelter", category: "Emergency Shelter" },
  { keyword: "detox", category: "Detox" },
  { keyword: "rehab", category: "Inpatient Rehab" },
  { keyword: "food pantry", category: "Food Pantry" },
  { keyword: "meal service", category: "Soup Kitchen" },
  { keyword: "job training", category: "Employment Assistance" },
  { keyword: "legal aid", category: "Legal Aid" },
  { keyword: "mental health", category: "Mental Health" },
  { keyword: "transitional housing", category: "Transitional Housing" },
];

function categorizeFromDescription(description) {
  if (!description) return null;
  const lower = description.toLowerCase();
  for (const rule of KEYWORD_RULES) {
    if (lower.includes(rule.keyword)) {
      return rule.category;
    }
  }
  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all resources without a category
    const resources = await base44.asServiceRole.entities.USRecoveryResource.list();
    const uncategorized = resources.filter(r => !r.resource_category);

    let updated = 0;
    let skipped = 0;

    for (const resource of uncategorized) {
      const category = categorizeFromDescription(resource.description);
      if (category) {
        await base44.asServiceRole.entities.USRecoveryResource.update(resource.id, {
          resource_category: category,
        });
        updated++;
      } else {
        skipped++;
      }
    }

    return Response.json({
      success: true,
      total_uncategorized: uncategorized.length,
      updated,
      skipped,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});