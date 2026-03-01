import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { facilityId } = body;

    const spaceId = Deno.env.get("CONTENTFUL_SPACE_ID");
    const accessToken = Deno.env.get("CONTENTFUL_ACCESS_TOKEN");
    const environment = Deno.env.get("CONTENTFUL_ENVIRONMENT") || 'master';

    if (!spaceId || !accessToken) {
      return Response.json({ success: false, error: "Contentful credentials not configured" }, { status: 500 });
    }

    const params = new URLSearchParams({
      content_type: 'facilityProfile',
      'fields.facilityId': facilityId,
      limit: '1'
    });

    const response = await fetch(
      `https://cdn.contentful.com/spaces/${spaceId}/environments/${environment}/entries?${params}`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );

    if (!response.ok) throw new Error(`Contentful error: ${response.status}`);

    const data = await response.json();
    if (data.items.length === 0) {
      return Response.json({ success: false, error: `No facility profile found for ${facilityId}` });
    }

    const item = data.items[0];
    const profile = {
      id: item.sys.id,
      facilityId: item.fields.facilityId,
      facilityName: item.fields.facilityName,
      logoUrl: item.fields.logoUrl,
      primaryColor: item.fields.primaryColor,
      accentColor: item.fields.accentColor,
      welcomeMessage: item.fields.welcomeMessage,
      featuredResourceIds: item.fields.featuredResourceIds || [],
      messageTemplates: item.fields.messageTemplates || [],
      customNudges: item.fields.customNudges || [],
      complianceThresholds: item.fields.complianceThresholds || {},
      brandedContent: item.fields.brandedContent || {}
    };

    return Response.json({ success: true, profile, cachedAt: new Date().toISOString() });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});