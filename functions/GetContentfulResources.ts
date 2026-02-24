export default async function GetContentfulResources(data, context) {
  const { userState, userZip, userCity, category } = data;
  
  const spaceId = context.secrets.CONTENTFUL_SPACE_ID;
  const accessToken = context.secrets.CONTENTFUL_ACCESS_TOKEN;
  const environment = context.secrets.CONTENTFUL_ENVIRONMENT || 'master';

  if (!spaceId || !accessToken) {
    return {
      success: false,
      error: "Contentful credentials not configured"
    };
  }

  try {
    const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/${environment}/entries`;
    
    // Build query for resources
    const params = new URLSearchParams({
      content_type: 'resource',
      limit: 100
    });

    // Filter by category if provided
    if (category) {
      params.append('fields.category', category);
    }

    const response = await fetch(`${url}?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Contentful API error: ${response.status}`);
    }

    const contentfulData = await response.json();
    
    // Filter resources by location scope
    const resources = contentfulData.items
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
      .filter(resource => {
        if (!resource.isActive) return false;
        
        // National resources always shown
        if (resource.level === 'national') return true;
        
        // State resources: match user's state
        if (resource.level === 'state' && resource.state === userState) return true;
        
        // Local resources: match ZIP or city
        if (resource.level === 'local') {
          const matchesState = resource.state === userState;
          const matchesZip = userZip && resource.zipCodes.includes(userZip);
          const matchesCity = userCity && resource.city?.toLowerCase() === userCity.toLowerCase();
          return matchesState && (matchesZip || matchesCity);
        }
        
        return false;
      });

    return {
      success: true,
      resources,
      cachedAt: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}