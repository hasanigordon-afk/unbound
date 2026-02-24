export default async function GetContentfulStateProfile(data, context) {
  const { stateCode } = data;
  
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
    
    const params = new URLSearchParams({
      content_type: 'stateProfile',
      'fields.stateCode': stateCode,
      limit: 1
    });

    const response = await fetch(`${url}?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Contentful API error: ${response.status}`);
    }

    const contentfulData = await response.json();
    
    if (contentfulData.items.length === 0) {
      return {
        success: false,
        error: `No state profile found for ${stateCode}`
      };
    }

    const item = contentfulData.items[0];
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

    return {
      success: true,
      profile,
      cachedAt: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}