import { createEntity, listEntity } from '../serviceUtils';

export function missingConfig(connectorName, requiredEnvVars) {
  return {
    connectorName,
    configured: false,
    status: 'not_configured',
    requiredEnvVars,
    message: `This data source is not configured yet. Add ${requiredEnvVars.join(', ')} in environment settings or import CSV data.`,
  };
}

export function configured(connectorName) {
  return { connectorName, configured: true, status: 'configured', message: 'Connector is configured.' };
}

export function dedupeKey(resource) {
  return [resource.name, resource.address, resource.phone, resource.source_name].map((value) => String(value || '').trim().toLowerCase()).join('|');
}

export async function upsertNormalizedResources(resources) {
  const existing = await listEntity('UniversalResource', []);
  const existingKeys = new Set(existing.map(dedupeKey));
  const inserted = [];

  for (const resource of resources) {
    const key = dedupeKey(resource);
    if (!resource.name || existingKeys.has(key)) continue;
    inserted.push(await createEntity('UniversalResource', resource));
    existingKeys.add(key);
  }

  return { inserted: inserted.length, duplicates_skipped: resources.length - inserted.length };
}

export async function logSync(connectorName, sourceName, status) {
  return createEntity('ResourceSyncLog', {
    connector_name: connectorName,
    source_name: sourceName,
    status: status.status,
    message: status.message,
    records_seen: status.records_seen || 0,
    records_inserted: status.records_inserted || 0,
    records_updated: status.records_updated || 0,
    duplicates_skipped: status.duplicates_skipped || 0,
    errors_json: status.errors_json || [],
    last_synced_at: new Date().toISOString(),
    required_env_vars: status.requiredEnvVars || [],
  });
}
