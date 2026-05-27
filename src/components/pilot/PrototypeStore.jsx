import { getDemoLocalList } from '@/data/pilotDemoData';

export const readLocalList = (key, fallback = []) => {
  try {
    const seededFallback = getDemoLocalList(key, fallback);
    const stored = JSON.parse(localStorage.getItem(key) || 'null');
    if (Array.isArray(stored) && stored.length > 0) return stored;
    return stored || seededFallback;
  } catch {
    return getDemoLocalList(key, fallback);
  }
};

export const writeLocalList = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};