/**
 * Pulls lat/lng out of a (multipart) request body and returns a
 * { lat, lng } object — or undefined when not provided/invalid.
 * Accepts flat `lat`/`lng` fields (what the multipart forms send) as well as
 * a nested `coordinates` object (JSON requests).
 */
export function parseCoordinates(body = {}) {
  const lat = body.lat ?? body.coordinates?.lat;
  const lng = body.lng ?? body.coordinates?.lng;
  if (lat === undefined || lng === undefined || lat === '' || lng === '') return undefined;
  const nlat = Number(lat);
  const nlng = Number(lng);
  if (!Number.isFinite(nlat) || !Number.isFinite(nlng)) return undefined;
  return { lat: nlat, lng: nlng };
}
