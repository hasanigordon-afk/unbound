// Location + distance helpers for Veterans Resources

// Haversine distance in miles
export function distanceMiles(lat1, lon1, lat2, lon2) {
  if ([lat1, lon1, lat2, lon2].some(v => v == null || isNaN(v))) return null;
  const R = 3958.8;
  const toRad = (d) => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getBrowserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("Geolocation not supported"));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
    );
  });
}

// Lookup a zip code → {lat, lon} using the free zippopotam.us API (US-only, no key)
export async function geocodeZip(zip) {
  if (!zip || zip.length < 5) return null;
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip.slice(0, 5)}`);
    if (!res.ok) return null;
    const data = await res.json();
    const place = data.places?.[0];
    if (!place) return null;
    return { lat: parseFloat(place.latitude), lon: parseFloat(place.longitude) };
  } catch {
    return null;
  }
}