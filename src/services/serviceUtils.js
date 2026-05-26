import { base44 } from '@/api/base44Client';

export const todayISO = () => new Date().toISOString().slice(0, 10);

export function startOfWeek(date = new Date()) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() - next.getDay());
  return next;
}

export function endOfWeek(date = new Date()) {
  const next = startOfWeek(date);
  next.setDate(next.getDate() + 7);
  return next;
}

export function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function currentUserEmail(user) {
  return user?.email || user?.created_by || '';
}

export async function getCurrentUser() {
  try {
    return await base44.auth.me();
  } catch {
    return null;
  }
}

export async function listEntity(entityName, fallback = []) {
  try {
    const entity = base44.entities?.[entityName];
    if (!entity?.list) return fallback;
    return asArray(await entity.list());
  } catch (error) {
    if (error?.response?.status === 404 || /404/.test(error.message || '')) return fallback;
    throw new Error(`${entityName} list failed: ${error.message}`);
  }
}

export async function filterEntity(entityName, filter, fallback = []) {
  try {
    const entity = base44.entities?.[entityName];
    if (!entity?.filter) return fallback;
    return asArray(await entity.filter(filter));
  } catch (error) {
    if (error?.response?.status === 404 || /404/.test(error.message || '')) return fallback;
    throw new Error(`${entityName} filter failed: ${error.message}`);
  }
}

export async function createEntity(entityName, payload) {
  const entity = base44.entities?.[entityName];
  if (!entity?.create) throw new Error(`${entityName} is not configured in Base44 yet.`);
  return entity.create(payload);
}

export async function updateEntity(entityName, id, payload) {
  const entity = base44.entities?.[entityName];
  if (!entity?.update) throw new Error(`${entityName} is not configured in Base44 yet.`);
  return entity.update(id, payload);
}

export async function deleteEntity(entityName, id) {
  const entity = base44.entities?.[entityName];
  if (!entity?.delete) throw new Error(`${entityName} is not configured in Base44 yet.`);
  return entity.delete(id);
}

export function matchesText(resource, query) {
  if (!query) return true;
  const haystack = [
    resource.name,
    resource.category,
    resource.subcategory,
    resource.description,
    resource.address,
    resource.city,
    resource.state,
    resource.zip,
    resource.tags?.join(' '),
  ].filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(query.toLowerCase());
}
