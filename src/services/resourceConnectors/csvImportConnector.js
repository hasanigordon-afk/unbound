import { upsertNormalizedResources } from './connectorUtils';

export function normalizeCsvResource(row) {
  return {
    name: row.name || row.organization_name,
    category: row.category || row.resource_category || 'Basic Needs',
    subcategory: row.subcategory || row.service_type,
    description: row.description || row.notes,
    address: row.address || row.street_address,
    city: row.city,
    state: row.state,
    zip: row.zip || row.zip_code,
    county: row.county,
    latitude: row.latitude ? Number(row.latitude) : undefined,
    longitude: row.longitude ? Number(row.longitude) : undefined,
    phone: row.phone,
    email: row.email,
    website: row.website,
    source_name: row.source_name || 'Admin CSV import',
    source_url: row.source_url,
    source_type: 'csv',
    verification_status: row.verification_status || 'imported',
    last_synced_at: new Date().toISOString(),
    accepts_medicaid: row.accepts_medicaid === true || row.accepts_medicaid === 'true',
    free_or_low_cost: row.free_or_low_cost === true || row.free_or_low_cost === 'true',
    veteran_focused: row.veteran_focused === true || row.veteran_focused === 'true',
    reentry_focused: row.reentry_focused === true || row.reentry_focused === 'true',
    tags: typeof row.tags === 'string' ? row.tags.split(';').map((tag) => tag.trim()).filter(Boolean) : row.tags,
  };
}

export async function importCsvResources(rows) {
  const normalized = rows.map(normalizeCsvResource).filter((row) => row.name);
  return upsertNormalizedResources(normalized);
}
