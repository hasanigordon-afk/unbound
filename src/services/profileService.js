import { createEntity, currentUserEmail, filterEntity, getCurrentUser, updateEntity } from './serviceUtils';

function firstNameFrom(user) {
  return user?.full_name?.split(' ')?.[0] || user?.email?.split('@')?.[0] || '';
}

export async function getCurrentUserProfile() {
  const user = await getCurrentUser();
  const email = currentUserEmail(user);
  if (!email) return { user: null, profile: null };

  const existing = await filterEntity('UserProfile', { email }, []);
  const profile = existing[0] || await createEntity('UserProfile', {
    auth_user_id: user?.id,
    first_name: firstNameFrom(user),
    display_name: user?.full_name || firstNameFrom(user) || email,
    email,
    role: user?.role || 'client',
    privacy_settings_json: {
      share_progress: false,
      show_location: false,
      show_support_circle: false,
    },
    community_visibility: 'private',
  });

  return { user, profile };
}

export async function updateProfile(profileId, updates) {
  return updateEntity('UserProfile', profileId, updates);
}

export async function updatePrivacySettings(profile, privacySettings) {
  return updateProfile(profile.id, {
    privacy_settings_json: {
      ...(profile.privacy_settings_json || {}),
      ...privacySettings,
    },
  });
}
