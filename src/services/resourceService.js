import { createEntity, deleteEntity, filterEntity, listEntity, matchesText } from './serviceUtils';

export const RESOURCE_CATEGORIES = [
  'Treatment & Recovery',
  'Meetings & Peer Support',
  'Basic Needs',
  'Reentry & Stability',
  'Employment & Education',
  'Veterans',
  'Wellness',
];

export const RESOURCE_SUBCATEGORIES = {
  'Treatment & Recovery': ['Detox', 'Inpatient rehab', 'Outpatient rehab', 'IOP', 'MAT', 'Mental health clinics', 'Crisis support', 'Peer recovery support', 'Sober living'],
  'Meetings & Peer Support': ['AA meetings', 'NA meetings', 'SMART Recovery', 'Celebrate Recovery', 'Online meetings', 'Sponsor connection', 'Peer mentor resources'],
  'Basic Needs': ['Shelters', 'Transitional housing', 'Food pantries', 'Soup kitchens', 'Clothing assistance', 'Hygiene/shower/laundry', 'Utility assistance', 'Benefits/SNAP/WIC'],
  'Reentry & Stability': ['Reentry programs', 'Legal aid', 'ID/document help', 'Probation/parole support', 'Expungement', 'Transportation help', 'Case management'],
  'Employment & Education': ['Job centers', 'Staffing agencies', 'Workforce training', 'Resume help', 'GED/adult education', 'Trade programs', 'CareerOneStop resources'],
  Veterans: ['VA facilities', 'Veteran crisis resources', 'Veteran housing', 'Veteran employment', 'Veteran mental health', 'Veteran benefits/navigation'],
  Wellness: ['Community centers', 'Meditation classes', 'Nutrition resources', 'Fitness support', 'Spiritual/community support', 'Holistic wellness'],
};

function normalizeLegacyLocalResource(resource) {
  return {
    ...resource,
    category: resource.category || 'Basic Needs',
    subcategory: resource.subcategory || resource.category,
    source_name: resource.source_name || 'ReZilient local resource import',
    source_type: resource.source_type || 'admin',
    verification_status: resource.verification_status || 'needs_review',
    free_or_low_cost: Boolean(resource.free_or_low_cost ?? resource.free_service),
    veteran_focused: Boolean(resource.veteran_focused ?? resource.veteran_support),
    hours_json: resource.hours_json,
    _sourceEntity: 'LocalResource',
  };
}

function hasValidHours(hours) {
  return !!hours && typeof hours === 'object' && Object.values(hours).some((day) => day?.open && day?.close);
}

export function calculateOpenNow(hoursJson) {
  if (!hasValidHours(hoursJson)) return { verified: false, open: null, label: 'Hours not verified' };
  const now = new Date();
  const day = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][now.getDay()];
  const today = hoursJson?.[day];
  if (!today?.open || !today?.close) return { verified: true, open: false, label: 'Closed today' };

  const [openHour, openMinute] = today.open.split(':').map(Number);
  const [closeHour, closeMinute] = today.close.split(':').map(Number);
  const current = now.getHours() * 60 + now.getMinutes();
  const start = openHour * 60 + openMinute;
  const end = closeHour * 60 + closeMinute;
  const open = current >= start && current <= end;
  return { verified: true, open, label: open ? `Open until ${today.close}` : 'Closed' };
}

export function distanceMiles(origin, resource) {
  if (!origin?.latitude || !resource?.latitude || !resource?.longitude) return null;
  const toRad = (value) => (value * Math.PI) / 180;
  const earthMiles = 3958.8;
  const dLat = toRad(resource.latitude - origin.latitude);
  const dLon = toRad(resource.longitude - origin.longitude);
  const lat1 = toRad(origin.latitude);
  const lat2 = toRad(resource.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return earthMiles * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export async function searchResources(filters = {}) {
  const [universal, legacyLocal] = await Promise.all([
    listEntity('UniversalResource', []),
    listEntity('LocalResource', []),
  ]);

  let resources = [
    ...universal.map((resource) => ({ ...resource, _sourceEntity: 'UniversalResource' })),
    ...legacyLocal.map(normalizeLegacyLocalResource),
  ].filter((resource) => resource.verification_status !== 'inactive');

  if (filters.query) resources = resources.filter((resource) => matchesText(resource, filters.query));
  if (filters.category && filters.category !== 'All') resources = resources.filter((resource) => resource.category === filters.category || resource.subcategory === filters.category);
  if (filters.subcategory) resources = resources.filter((resource) => resource.subcategory === filters.subcategory);
  if (filters.state) resources = resources.filter((resource) => String(resource.state || '').toLowerCase() === filters.state.toLowerCase());
  if (filters.zip) resources = resources.filter((resource) => String(resource.zip || '').startsWith(filters.zip));
  if (filters.freeOrLowCost) resources = resources.filter((resource) => resource.free_or_low_cost);
  if (filters.acceptsMedicaid) resources = resources.filter((resource) => resource.accepts_medicaid);
  if (filters.veteranFocused) resources = resources.filter((resource) => resource.veteran_focused);
  if (filters.reentryFocused) resources = resources.filter((resource) => resource.reentry_focused);
  if (filters.crisisAvailable) resources = resources.filter((resource) => resource.crisis_available || resource.emergency_available);
  if (filters.virtualAvailable) resources = resources.filter((resource) => resource.virtual_available);
  if (filters.openNow) resources = resources.filter((resource) => calculateOpenNow(resource.hours_json).open === true);

  return resources
    .map((resource) => ({ ...resource, distance: distanceMiles(filters.location, resource), openStatus: calculateOpenNow(resource.hours_json) }))
    .sort((a, b) => {
      if (a.distance == null && b.distance == null) return String(a.name).localeCompare(String(b.name));
      if (a.distance == null) return 1;
      if (b.distance == null) return -1;
      return a.distance - b.distance;
    });
}

export async function getNearbyResources(location, filters = {}) {
  return searchResources({ ...filters, location });
}

export async function getResourceById(resourceId) {
  const all = await searchResources();
  return all.find((resource) => resource.id === resourceId) || null;
}

export async function getSavedResources(user) {
  if (!user?.email) return [];
  return filterEntity('SavedUniversalResource', { user_email: user.email }, []);
}

export async function saveResource(user, resource) {
  if (!user?.email) throw new Error('Sign in is required to save a resource.');
  const existing = await getSavedResources(user);
  if (existing.some((item) => item.resource_id === resource.id)) return existing.find((item) => item.resource_id === resource.id);
  return createEntity('SavedUniversalResource', {
    user_id: user.id,
    user_email: user.email,
    resource_id: resource.id,
    resource_name: resource.name,
    resource_category: resource.category,
    saved_at: new Date().toISOString(),
  });
}

export async function unsaveResource(user, resource) {
  const existing = await getSavedResources(user);
  const saved = existing.find((item) => item.resource_id === resource.id);
  if (!saved) return null;
  return deleteEntity('SavedUniversalResource', saved.id);
}

export async function reportIncorrectResource(user, resource, reason = 'Incorrect information') {
  return createEntity('ResourceReport', {
    user_email: user?.email,
    resource_id: resource.id,
    reason,
    status: 'open',
    reported_at: new Date().toISOString(),
  });
}
