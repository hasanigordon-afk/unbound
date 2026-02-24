export default async function GetContentfulFacilityProfile(data, context) {
  const { facilityId } = data;
  
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
      content_type: 'facilityProfile',
      'fields.facilityId': facilityId,
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
        error: `No facility profile found for ${facilityId}`
      };
    }

    const item = contentfulData.items[0];
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