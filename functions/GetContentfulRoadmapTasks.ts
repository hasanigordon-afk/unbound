import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { stateCode, facilityId } = body;

    const spaceId = Deno.env.get("CONTENTFUL_SPACE_ID");
    const accessToken = Deno.env.get("CONTENTFUL_ACCESS_TOKEN");
    const environment = Deno.env.get("CONTENTFUL_ENVIRONMENT") || 'master';

    if (!spaceId || !accessToken) {
      return Response.json({ success: false, error: "Contentful credentials not configured" }, { status: 500 });
    }

    const params = new URLSearchParams({ content_type: 'roadmapTaskTemplate', limit: '200' });

    const response = await fetch(
      `https://cdn.contentful.com/spaces/${spaceId}/environments/${environment}/entries?${params}`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );

    if (!response.ok) throw new Error(`Contentful error: ${response.status}`);

    const data = await response.json();

    const tasks = data.items
      .map(item => ({
        id: item.sys.id,
        phase: item.fields.phase,
        taskName: item.fields.taskName,
        taskDescription: item.fields.taskDescription,
        sortOrder: item.fields.sortOrder,
        scope: item.fields.scope || 'default',
        scopeId: item.fields.scopeId,
        estimatedDays: item.fields.estimatedDays,
        resources: item.fields.resources || [],
        isActive: item.fields.isActive !== false
      }))
      .filter(task => {
        if (!task.isActive) return false;
        if (task.scope === 'facility' && task.scopeId === facilityId) return true;
        if (task.scope === 'state' && task.scopeId === stateCode) return true;
        if (task.scope === 'default' || !task.scope) return true;
        return false;
      })
      .sort((a, b) => a.phase !== b.phase ? a.phase - b.phase : a.sortOrder - b.sortOrder);

    return Response.json({
      success: true,
      tasks,
      tasksByPhase: { 1: tasks.filter(t => t.phase === 1), 2: tasks.filter(t => t.phase === 2), 3: tasks.filter(t => t.phase === 3) },
      cachedAt: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});