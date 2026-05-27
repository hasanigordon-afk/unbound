import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { engineerSeePlan, extractSeeWorkflow } from '../../../shared/seeWorkflow.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await req.json();
    if (payload.action === 'scan') return Response.json(extractSeeWorkflow(payload.raw_text || ''));
    if (payload.action === 'engineer') return Response.json(engineerSeePlan(payload.extraction || {}));
    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});