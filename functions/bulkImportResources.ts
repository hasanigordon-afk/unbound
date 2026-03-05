import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const REQUIRED_FIELDS = ['organization_name', 'state', 'city', 'resource_category'];

const VALID_CATEGORIES = [
  "Housing", "Emergency Shelter", "Transitional Housing", "Addiction Treatment",
  "Detox", "Inpatient Rehab", "Outpatient Rehab", "Medication Assisted Treatment",
  "Mental Health", "Food Pantry", "Soup Kitchen", "Employment Assistance",
  "Reentry Services", "Legal Aid", "Transportation", "Clothing Assistance", "Peer Support"
];

async function geocodeAddress(address, city, state, zip) {
  const query = [address, city, state, zip].filter(Boolean).join(', ');
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'UnboundApp/1.0' } });
    const data = await res.json();
    if (data && data[0]) {
      return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
    }
  } catch (_) {}
  return null;
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map((line, idx) => {
    // Handle quoted fields with commas
    const values = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; }
      else if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
      else { current += char; }
    }
    values.push(current.trim());
    const row = { _row: idx + 2 };
    headers.forEach((h, i) => { row[h] = values[i] || ''; });
    return row;
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { csvText, filename } = body;

    if (!csvText) {
      return Response.json({ error: 'No CSV content provided' }, { status: 400 });
    }

    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      return Response.json({ error: 'CSV is empty or has no data rows' }, { status: 400 });
    }

    // Load existing resources for duplicate detection
    const existing = await base44.asServiceRole.entities.USRecoveryResource.list();
    const existingKeys = new Set(
      existing.map(r => `${(r.organization_name || '').toLowerCase().trim()}|${(r.street_address || '').toLowerCase().trim()}`)
    );

    const errorDetails = [];
    let inserted = 0;
    let duplicates_skipped = 0;
    let validation_errors = 0;
    let geocoded = 0;

    for (const row of rows) {
      const rowNum = row._row;

      // Validate required fields
      const missing = REQUIRED_FIELDS.filter(f => !row[f] || row[f].trim() === '');
      if (missing.length > 0) {
        errorDetails.push(`Row ${rowNum}: Missing required fields: ${missing.join(', ')}`);
        validation_errors++;
        continue;
      }

      // Normalize category
      const category = VALID_CATEGORIES.find(
        c => c.toLowerCase() === (row.resource_category || '').toLowerCase().trim()
      ) || row.resource_category.trim();

      // Duplicate check
      const key = `${row.organization_name.toLowerCase().trim()}|${(row.street_address || '').toLowerCase().trim()}`;
      if (existingKeys.has(key)) {
        duplicates_skipped++;
        errorDetails.push(`Row ${rowNum}: Duplicate skipped — ${row.organization_name} at ${row.street_address || 'no address'}`);
        continue;
      }

      // Build record
      const record = {
        organization_name: row.organization_name.trim(),
        program_name: row.program_name?.trim() || undefined,
        resource_category: category,
        service_type: row.service_type?.trim() || undefined,
        state: row.state.trim().toUpperCase(),
        county: row.county?.trim() || undefined,
        city: row.city.trim(),
        street_address: row.street_address?.trim() || undefined,
        zip_code: row.zip_code?.trim() || undefined,
        phone: row.phone?.trim() || undefined,
        email: row.email?.trim() || undefined,
        website: row.website?.trim() || undefined,
        description: row.description?.trim() || undefined,
        accepts_medicaid: ['yes', 'true', '1'].includes((row.accepts_medicaid || '').toLowerCase().trim()),
        accepts_uninsured: ['yes', 'true', '1'].includes((row.accepts_uninsured || '').toLowerCase().trim()),
        intake_method: row.intake_method?.trim() || undefined,
        last_verified: row.last_verified?.trim() || undefined,
      };

      // Geocode if lat/lng missing
      const lat = parseFloat(row.latitude);
      const lng = parseFloat(row.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        record.latitude = lat;
        record.longitude = lng;
      } else if (row.street_address || row.city) {
        const coords = await geocodeAddress(row.street_address, row.city, row.state, row.zip_code);
        if (coords) {
          record.latitude = coords.latitude;
          record.longitude = coords.longitude;
          geocoded++;
        }
        // Throttle geocoding requests
        await new Promise(r => setTimeout(r, 300));
      }

      await base44.asServiceRole.entities.USRecoveryResource.create(record);
      existingKeys.add(key);
      inserted++;
    }

    // Log the import
    const status = validation_errors === rows.length ? 'failed' : inserted === 0 ? 'partial' : 'success';
    await base44.asServiceRole.entities.ImportLog.create({
      filename: filename || 'upload.csv',
      imported_by: user.email,
      total_rows: rows.length,
      inserted,
      duplicates_skipped,
      validation_errors,
      geocoded,
      status,
      error_details: errorDetails,
    });

    return Response.json({
      success: true,
      total_rows: rows.length,
      inserted,
      duplicates_skipped,
      validation_errors,
      geocoded,
      status,
      error_details: errorDetails,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});