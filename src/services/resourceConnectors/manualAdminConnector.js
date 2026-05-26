import { createEntity } from '../serviceUtils';

export async function createManualResource(payload) {
  return createEntity('UniversalResource', {
    source_name: payload.source_name || 'Manual admin entry',
    source_type: 'manual',
    verification_status: payload.verification_status || 'needs_review',
    last_verified_at: payload.verification_status === 'verified' ? new Date().toISOString() : undefined,
    ...payload,
  });
}
