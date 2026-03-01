import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { stateCode } = body;

    const spaceId = Deno.env.get("CONTENTFUL_SPACE_ID");
    const accessToken = Deno.env.get("CONTENTFUL_ACCESS_TOKEN");
    const environment = Deno.env.get("CONTENTFUL_ENVIRONMENT") || 'master';

    if (!spaceId || !accessToken) {
      return Response.json({ success: false, error: "Contentful credentials not configured" }, { status: 500 });
    }

    const params = new URLSearchParams({
      content_type: 'stateProfile',
      'fields.stateCode': stateCode,
      limit: '1'
    });

    const response = await fetch(
      `https://cdn.contentful.com/spaces/${spaceId}/environments/${environment}/entries?${params}`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );

    if (!response.ok) throw new Error(`Contentful error: ${response.status}`);

    const data = await response.json();
    if (data.items.length === 0) {
      return Response.json({ success: false, error: `No state profile found for ${stateCode}` });
    }

    const item = data.items[0];
    const profile = {
      id: item.sys.id,
      stateCode: item.fields.stateCode,
      stateName: item.fields.stateName,
      dmvWebsite: item.fields.dmvWebsite,
      snapWebsite: item.fields.snapWebsite,
      medicaidWebsite: item.fields.medicaidWebsite,
      unemploymentWebsite: item.fields.unemploymentWebsite,
      housingAssistanceWebsite: item.fields.housingAssistanceWebsite,
      crisisHotline: item.fields.crisisHotline,
      reentryPrograms: item.fields.reentryPrograms || [],
      complianceRequirements: item.fields.complianceRequirements || [],
      notes: item.fields.notes
    };

    return Response.json({ success: true, profile, cachedAt: new Date().toISOString() });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});