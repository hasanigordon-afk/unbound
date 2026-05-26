import { createEntity, filterEntity, updateEntity } from './serviceUtils';

export async function getSupportConnections(user) {
  if (!user?.email) return [];
  return filterEntity('SupportConnection', { user_email: user.email }, []);
}

export async function createSupportConnection(user, payload) {
  if (!user?.email) throw new Error('Sign in is required to add a support connection.');
  return createEntity('SupportConnection', {
    user_id: user.id,
    user_email: user.email,
    relationship_status: 'active',
    can_view_progress: false,
    can_receive_alerts: false,
    permission_scope_json: {},
    ...payload,
  });
}

export async function updateSupportPermissions(connectionId, updates) {
  return updateEntity('SupportConnection', connectionId, updates);
}

export async function removeSupportConnection(connectionId) {
  return updateEntity('SupportConnection', connectionId, { relationship_status: 'inactive' });
}

export async function requestSupport(connectionId) {
  return updateEntity('SupportConnection', connectionId, { relationship_status: 'pending' });
}
