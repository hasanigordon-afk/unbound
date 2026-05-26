import { createEntity, deleteEntity, filterEntity, listEntity } from './serviceUtils';

export async function getMediaItems(filters = {}) {
  let media = await listEntity('MediaItem', []);
  media = media.filter((item) => item.is_approved === true);
  if (filters.mediaType) media = media.filter((item) => item.media_type === filters.mediaType);
  if (filters.category) media = media.filter((item) => item.category === filters.category);
  return media.sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
}

export async function getSavedMedia(user) {
  if (!user?.email) return [];
  return filterEntity('SavedMediaItem', { user_email: user.email }, []);
}

export async function saveMediaItem(user, media) {
  if (!user?.email) throw new Error('Sign in is required to save media.');
  const saved = await getSavedMedia(user);
  if (saved.some((item) => item.media_id === media.id)) return saved.find((item) => item.media_id === media.id);
  return createEntity('SavedMediaItem', {
    user_id: user.id,
    user_email: user.email,
    media_id: media.id,
    saved_at: new Date().toISOString(),
  });
}

export async function unsaveMediaItem(user, media) {
  const saved = await getSavedMedia(user);
  const row = saved.find((item) => item.media_id === media.id);
  if (!row) return null;
  return deleteEntity('SavedMediaItem', row.id);
}

export function filterMediaByCategory(items, category) {
  if (!category || category === 'All') return items;
  return items.filter((item) => item.category === category || item.media_type === category);
}
