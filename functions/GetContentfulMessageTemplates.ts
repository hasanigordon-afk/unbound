import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { facilityId, templateType } = body;

    const spaceId = Deno.env.get("CONTENTFUL_SPACE_ID");
    const accessToken = Deno.env.get("CONTENTFUL_ACCESS_TOKEN");
    const environment = Deno.env.get("CONTENTFUL_ENVIRONMENT") || 'master';

    if (!spaceId || !accessToken) {
      return Response.json({ success: false, error: "Contentful credentials not configured" }, { status: 500 });
    }

    const params = new URLSearchParams({ content_type: 'messageTemplate', limit: '100' });
    if (templateType) params.append('fields.templateType', templateType);

    const response = await fetch(
      `https://cdn.contentful.com/spaces/${spaceId}/environments/${environment}/entries?${params}`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );

    if (!response.ok) throw new Error(`Contentful error: ${response.status}`);

    const data = await response.json();

    const templates = data.items
      .map(item => ({
        id: item.sys.id,
        templateName: item.fields.templateName,
        templateType: item.fields.templateType,
        subject: item.fields.subject,
        body: item.fields.body,
        scope: item.fields.scope || 'default',
        scopeId: item.fields.scopeId,
        variables: item.fields.variables || [],
        isActive: item.fields.isActive !== false
      }))
      .filter(t => {
        if (!t.isActive) return false;
        if (t.scope === 'facility' && t.scopeId === facilityId) return true;
        if (t.scope === 'default' || !t.scope) return true;
        return false;
      });

    return Response.json({ success: true, templates, cachedAt: new Date().toISOString() });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});