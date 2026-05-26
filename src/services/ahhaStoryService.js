import { createEntity, filterEntity, listEntity, updateEntity } from './serviceUtils';

function storyBody(payload) {
  return [payload.before_moment, payload.turning_point, payload.emotional_shift, payload.next_action, payload.advice_to_others]
    .filter(Boolean)
    .join('\n\n');
}

export async function getApprovedStories() {
  const stories = await listEntity('AhHaStory', []);
  return stories
    .filter((story) => story.approval_status === 'approved' && story.visibility_type !== 'private')
    .sort((a, b) => new Date(b.published_at || b.created_date || 0) - new Date(a.published_at || a.created_date || 0));
}

export async function getMyStories(user) {
  if (!user?.email) return [];
  return filterEntity('AhHaStory', { user_email: user.email }, []);
}

export async function submitStory(user, payload) {
  if (!user?.email) throw new Error('Sign in is required to submit an AhHa story.');
  const body = storyBody(payload);
  return createEntity('AhHaStory', {
    user_email: user.email,
    title: payload.title,
    before_moment: payload.before_moment,
    turning_point: payload.turning_point || body,
    emotional_shift: payload.emotional_shift,
    next_action: payload.next_action,
    advice_to_others: payload.advice_to_others,
    story_preview: (payload.turning_point || body).slice(0, 220),
    full_story_content: body,
    visibility_type: payload.visibility_type || 'private',
    approval_status: payload.approval_status || 'pending_review',
    is_anonymous: payload.display_name_mode === 'anonymous',
    display_name_mode: payload.display_name_mode || 'anonymous',
    submitted_at: new Date().toISOString(),
  });
}

export async function saveDraft(user, payload) {
  return submitStory(user, { ...payload, approval_status: 'draft', visibility_type: payload.visibility_type || 'private' });
}

export async function moderateStory(storyId, updates) {
  return updateEntity('AhHaStory', storyId, updates);
}

export async function reactToStory(story) {
  return updateEntity('AhHaStory', story.id, { reactions_count: (story.reactions_count || 0) + 1 });
}
