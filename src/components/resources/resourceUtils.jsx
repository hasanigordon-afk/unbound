export const categories = ['Treatment & Recovery', 'Meetings & Peer Support', 'Basic Needs', 'Reentry & Stability', 'Employment & Education', 'Veterans', 'Wellness'];

export const filters = ['Near Me', 'Open Now', 'Saved', 'Free / Low Cost', 'Medicaid Accepted', 'Veteran Focused', 'Reentry Focused', 'Crisis / Emergency', 'Virtual Available'];

export const defaultLocation = null;

export function distanceMiles(a, b) {
  if (!a?.latitude || !b?.latitude) return 0;
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function openStatus(hours = {}) {
  if (!hours || typeof hours !== 'object' || !Object.values(hours).some((day) => day?.open && day?.close)) {
    return { verified: false, open: null, label: 'Hours not verified' };
  }
  const now = new Date();
  const day = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][now.getDay()];
  const today = hours?.[day];
  if (!today?.open || !today?.close) return { verified: true, open: false, label: 'Closed today' };
  const current = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = today.open.split(':').map(Number);
  const [ch, cm] = today.close.split(':').map(Number);
  const start = oh * 60 + om;
  const end = ch * 60 + cm;
  const open = current >= start && current <= end;
  return { verified: true, open, label: open ? `Open until ${formatTime(today.close)}` : 'Closed' };
}

export function formatTime(time) {
  const [hour, minute] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hour, minute);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}