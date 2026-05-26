import { createEntity, deleteEntity, filterEntity, listEntity, updateEntity } from './serviceUtils';

export async function getCommunityFeed() {
  const posts = await listEntity('CommunityPost', []);
  return posts
    .filter((post) => ['approved', undefined, null].includes(post.moderation_status))
    .sort((a, b) => new Date(b.created_date || b.created_at || 0) - new Date(a.created_date || a.created_at || 0));
}

export async function createPost(user, payload) {
  if (!user?.email) throw new Error('Sign in is required to post.');
  return createEntity('CommunityPost', {
    title: payload.title || 'Community post',
    content: payload.body,
    category: payload.category || 'support',
    post_type: payload.post_type || 'feed',
    group_id: payload.group_id,
    is_anonymous: payload.visibility === 'anonymous',
    moderation_status: 'pending',
  });
}

export async function deletePost(postId) {
  return updateEntity('CommunityPost', postId, { moderation_status: 'flagged', moderation_reason: 'Removed by author or moderator' });
}

export async function getGroups() {
  return listEntity('CommunityGroup', []);
}

export async function getGroupMembers(user) {
  if (!user?.email) return [];
  return filterEntity('GroupMember', { user_email: user.email }, []);
}

export async function joinGroup(user, group) {
  if (!user?.email) throw new Error('Sign in is required to join a group.');
  const memberships = await getGroupMembers(user);
  if (memberships.some((item) => item.group_id === group.id)) return memberships.find((item) => item.group_id === group.id);
  return createEntity('GroupMember', {
    group_id: group.id,
    user_id: user.id,
    user_email: user.email,
    role: 'member',
    joined_at: new Date().toISOString(),
  });
}

export async function leaveGroup(user, group) {
  const memberships = await getGroupMembers(user);
  const membership = memberships.find((item) => item.group_id === group.id);
  if (!membership) return null;
  return deleteEntity('GroupMember', membership.id);
}

export async function getMembers() {
  const profiles = await listEntity('UserProfile', []);
  return profiles.filter((profile) => profile.community_visibility && profile.community_visibility !== 'private');
}

export async function getCounselors(user) {
  const support = user?.email ? await filterEntity('SupportConnection', { user_email: user.email }, []) : [];
  return support.filter((connection) => connection.role === 'counselor' && connection.relationship_status !== 'inactive');
}

export async function getSponsors(user) {
  const support = user?.email ? await filterEntity('SupportConnection', { user_email: user.email }, []) : [];
  return support.filter((connection) => connection.role === 'sponsor' && connection.relationship_status !== 'inactive');
}
