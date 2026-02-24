export default async function GetContentfulMessageTemplates(data, context) {
  const { facilityId, templateType } = data;
  
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
      content_type: 'messageTemplate',
      limit: 100
    });

    if (templateType) {
      params.append('fields.templateType', templateType);
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
    
    // Filter templates by facility or default
    const templates = contentfulData.items
      .map(item => ({
        id: item.sys.id,
        templateName: item.fields.templateName,
        templateType: item.fields.templateType, // 'nudge', 'welcome', 'milestone', 'reminder', 'alert'
        subject: item.fields.subject,
        body: item.fields.body,
        scope: item.fields.scope || 'default', // 'default', 'facility'
        scopeId: item.fields.scopeId,
        variables: item.fields.variables || [], // Available placeholders
        isActive: item.fields.isActive !== false
      }))
      .filter(template => {
        if (!template.isActive) return false;
        
        // Facility-specific templates
        if (template.scope === 'facility' && template.scopeId === facilityId) return true;
        
        // Default templates
        if (template.scope === 'default' || !template.scope) return true;
        
        return false;
      });

    return {
      success: true,
      templates,
      cachedAt: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}