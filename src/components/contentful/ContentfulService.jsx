import { base44 } from "@/api/base44Client";

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_KEYS = {
  RESOURCES: 'contentful_resources',
  STATE_PROFILE: 'contentful_state_profile',
  FACILITY_PROFILE: 'contentful_facility_profile',
  ROADMAP_TASKS: 'contentful_roadmap_tasks',
  MESSAGE_TEMPLATES: 'contentful_message_templates'
};

class ContentfulService {
  // Get resources with caching
  async getResources(userState, userZip, userCity, category) {
    const cacheKey = `${CACHE_KEYS.RESOURCES}_${userState}_${userZip}_${category || 'all'}`;
    const cached = this.getCached(cacheKey);
    
    if (cached) {
      // Background refresh if cache is old
      if (this.isCacheOld(cached.cachedAt)) {
        this.refreshResourcesInBackground(userState, userZip, userCity, category, cacheKey);
      }
      return cached.resources;
    }

    // Fetch fresh data
    const result = await base44.functions.GetContentfulResources({
      userState,
      userZip,
      userCity,
      category
    });

    if (result.success) {
      this.setCache(cacheKey, result);
      return result.resources;
    }

    return [];
  }

  async refreshResourcesInBackground(userState, userZip, userCity, category, cacheKey) {
    try {
      const result = await base44.functions.GetContentfulResources({
        userState,
        userZip,
        userCity,
        category
      });
      if (result.success) {
        this.setCache(cacheKey, result);
      }
    } catch (error) {
      console.error('Background refresh failed:', error);
    }
  }

  // Get state profile with caching
  async getStateProfile(stateCode) {
    const cacheKey = `${CACHE_KEYS.STATE_PROFILE}_${stateCode}`;
    const cached = this.getCached(cacheKey);
    
    if (cached) {
      if (this.isCacheOld(cached.cachedAt)) {
        this.refreshStateProfileInBackground(stateCode, cacheKey);
      }
      return cached.profile;
    }

    const result = await base44.functions.GetContentfulStateProfile({ stateCode });
    
    if (result.success) {
      this.setCache(cacheKey, result);
      return result.profile;
    }

    return null;
  }

  async refreshStateProfileInBackground(stateCode, cacheKey) {
    try {
      const result = await base44.functions.GetContentfulStateProfile({ stateCode });
      if (result.success) {
        this.setCache(cacheKey, result);
      }
    } catch (error) {
      console.error('Background refresh failed:', error);
    }
  }

  // Get facility profile with caching
  async getFacilityProfile(facilityId) {
    const cacheKey = `${CACHE_KEYS.FACILITY_PROFILE}_${facilityId}`;
    const cached = this.getCached(cacheKey);
    
    if (cached) {
      if (this.isCacheOld(cached.cachedAt)) {
        this.refreshFacilityProfileInBackground(facilityId, cacheKey);
      }
      return cached.profile;
    }

    const result = await base44.functions.GetContentfulFacilityProfile({ facilityId });
    
    if (result.success) {
      this.setCache(cacheKey, result);
      return result.profile;
    }

    return null;
  }

  async refreshFacilityProfileInBackground(facilityId, cacheKey) {
    try {
      const result = await base44.functions.GetContentfulFacilityProfile({ facilityId });
      if (result.success) {
        this.setCache(cacheKey, result);
      }
    } catch (error) {
      console.error('Background refresh failed:', error);
    }
  }

  // Get roadmap tasks with caching
  async getRoadmapTasks(stateCode, facilityId) {
    const cacheKey = `${CACHE_KEYS.ROADMAP_TASKS}_${stateCode}_${facilityId || 'none'}`;
    const cached = this.getCached(cacheKey);
    
    if (cached) {
      if (this.isCacheOld(cached.cachedAt)) {
        this.refreshRoadmapTasksInBackground(stateCode, facilityId, cacheKey);
      }
      return cached.tasks;
    }

    const result = await base44.functions.GetContentfulRoadmapTasks({ stateCode, facilityId });
    
    if (result.success) {
      this.setCache(cacheKey, result);
      return result.tasks;
    }

    return [];
  }

  async refreshRoadmapTasksInBackground(stateCode, facilityId, cacheKey) {
    try {
      const result = await base44.functions.GetContentfulRoadmapTasks({ stateCode, facilityId });
      if (result.success) {
        this.setCache(cacheKey, result);
      }
    } catch (error) {
      console.error('Background refresh failed:', error);
    }
  }

  // Get message templates with caching
  async getMessageTemplates(facilityId, templateType) {
    const cacheKey = `${CACHE_KEYS.MESSAGE_TEMPLATES}_${facilityId || 'none'}_${templateType || 'all'}`;
    const cached = this.getCached(cacheKey);
    
    if (cached) {
      if (this.isCacheOld(cached.cachedAt)) {
        this.refreshMessageTemplatesInBackground(facilityId, templateType, cacheKey);
      }
      return cached.templates;
    }

    const result = await base44.functions.GetContentfulMessageTemplates({ facilityId, templateType });
    
    if (result.success) {
      this.setCache(cacheKey, result);
      return result.templates;
    }

    return [];
  }

  async refreshMessageTemplatesInBackground(facilityId, templateType, cacheKey) {
    try {
      const result = await base44.functions.GetContentfulMessageTemplates({ facilityId, templateType });
      if (result.success) {
        this.setCache(cacheKey, result);
      }
    } catch (error) {
      console.error('Background refresh failed:', error);
    }
  }

  // Cache utilities
  getCached(key) {
    try {
      const cached = localStorage.getItem(key);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }

  setCache(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Cache write failed:', error);
    }
  }

  isCacheOld(cachedAt) {
    if (!cachedAt) return true;
    const age = Date.now() - new Date(cachedAt).getTime();
    return age > CACHE_DURATION;
  }

  clearCache() {
    Object.values(CACHE_KEYS).forEach(prefix => {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });
    });
  }
}

export const contentfulService = new ContentfulService();