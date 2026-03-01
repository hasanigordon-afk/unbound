import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { userState, userZip, userCity, category } = body;

    const spaceId = Deno.env.get("CONTENTFUL_SPACE_ID");
    const accessToken = Deno.env.get("CONTENTFUL_ACCESS_TOKEN");
    const environment = Deno.env.get("CONTENTFUL_ENVIRONMENT") || 'master';

    if (!spaceId || !accessToken) {
      return Response.json({ success: false, error: "Contentful credentials not configured" }, { status: 500 });
    }

    const params = new URLSearchParams({ content_type: 'resource', limit: '200' });
    if (category) params.append('fields.category', category);

    const response = await fetch(
      `https://cdn.contentful.com/spaces/${spaceId}/environments/${environment}/entries?${params}`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );

    if (!response.ok) throw new Error(`Contentful error: ${response.status}`);

    const data = await response.json();

    const resources = data.items
      .map(item => ({
        id: item.sys.id,
        name: item.fields.name,
        level: item.fields.level,
        category: item.fields.category,
        state: item.fields.state,
        zipCodes: item.fields.zipCodes || [],
        address: item.fields.address,
        city: item.fields.city,
        phone: item.fields.phone,
        website: item.fields.website,
        hours: item.fields.hours,
        description: item.fields.description,
        tags: item.fields.tags || [],
        latitude: item.fields.latitude,
        longitude: item.fields.longitude,
        isActive: item.fields.isActive !== false
      }))
      .filter(r => {
        if (!r.isActive) return false;
        if (r.level === 'national') return true;
        if (r.level === 'state' && r.state === userState) return true;
        if (r.level === 'local') {
          const matchesState = r.state === userState;
          const matchesZip = userZip && r.zipCodes.includes(userZip);
          const matchesCity = userCity && r.city?.toLowerCase() === userCity?.toLowerCase();
          return matchesState && (matchesZip || matchesCity);
        }
        return false;
      });

    return Response.json({ success: true, resources, cachedAt: new Date().toISOString() });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});