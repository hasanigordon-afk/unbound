export default async function GetContentfulRoadmapTasks(data, context) {
  const { stateCode, facilityId } = data;
  
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
      content_type: 'roadmapTaskTemplate',
      limit: 100
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
    
    // Filter and prioritize tasks: facility-specific > state-specific > default
    const tasks = contentfulData.items
      .map(item => ({
        id: item.sys.id,
        phase: item.fields.phase,
        taskName: item.fields.taskName,
        taskDescription: item.fields.taskDescription,
        sortOrder: item.fields.sortOrder,
        scope: item.fields.scope || 'default', // 'default', 'state', 'facility'
        scopeId: item.fields.scopeId, // state code or facility ID
        estimatedDays: item.fields.estimatedDays,
        resources: item.fields.resources || [],
        isActive: item.fields.isActive !== false
      }))
      .filter(task => {
        if (!task.isActive) return false;
        
        // Facility-specific tasks
        if (task.scope === 'facility' && task.scopeId === facilityId) return true;
        
        // State-specific tasks
        if (task.scope === 'state' && task.scopeId === stateCode) return true;
        
        // Default tasks (no scope or default scope)
        if (task.scope === 'default' || !task.scope) return true;
        
        return false;
      })
      .sort((a, b) => {
        // Sort by phase first, then sortOrder
        if (a.phase !== b.phase) return a.phase - b.phase;
        return a.sortOrder - b.sortOrder;
      });

    // Group by phase
    const tasksByPhase = {
      1: tasks.filter(t => t.phase === 1),
      2: tasks.filter(t => t.phase === 2),
      3: tasks.filter(t => t.phase === 3)
    };

    return {
      success: true,
      tasks,
      tasksByPhase,
      cachedAt: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}