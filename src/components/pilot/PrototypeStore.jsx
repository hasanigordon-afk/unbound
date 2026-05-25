export const readLocalList = (key, fallback = []) => {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') || fallback;
  } catch {
    return fallback;
  }
};

export const writeLocalList = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};