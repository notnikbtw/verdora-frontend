import type { GeoPoint, Settlement } from '@/schemas/address.schema';

// Draft restoration also runs in the shared navigation/logout code. Keep these
// guards independent of the form schema so geocoding validation stays lazy.
export const isGeoPoint = (value: unknown): value is GeoPoint => {
  if (!value || typeof value !== 'object') return false;
  const point = value as Record<string, unknown>;
  return (
    typeof point.lat === 'number' &&
    Number.isFinite(point.lat) &&
    Math.abs(point.lat) <= 90 &&
    typeof point.lng === 'number' &&
    Number.isFinite(point.lng) &&
    Math.abs(point.lng) <= 180
  );
};

export const isSettlement = (value: unknown): value is Settlement => {
  if (!value || typeof value !== 'object') return false;
  const data = value as Record<string, unknown>;
  const text = (input: unknown, max: number) =>
    typeof input === 'string' && input.trim().length > 0 && input.length <= max;
  return (
    data.countryCode === 'UA' &&
    text(data.id, 100) &&
    text(data.name, 100) &&
    text(data.label, 300) &&
    (data.region === undefined ||
      (typeof data.region === 'string' && data.region.length <= 150)) &&
    isGeoPoint(data.position) &&
    (data.bounds === undefined ||
      (Array.isArray(data.bounds) &&
        data.bounds.length === 4 &&
        data.bounds.every(
          item => typeof item === 'number' && Number.isFinite(item)
        )))
  );
};

export const normalizeAddressText = (value: string) =>
  value.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase();

export const isSelectedSettlement = (
  city: string | undefined,
  settlement: Settlement | null | undefined
) =>
  Boolean(
    city?.trim() &&
    settlement?.countryCode === 'UA' &&
    normalizeAddressText(city) === normalizeAddressText(settlement.name)
  );

export const isStreetName = (value: string) =>
  value.trim().length >= 2 && /\p{L}/u.test(value);

export const isBuildingNumber = (value: string) =>
  /^(?:\d[\p{L}\d]*(?:[\s/-]+[\p{L}\d]+)*|б\/н)$/iu.test(value.trim());

export const distanceKm = (a: GeoPoint, b: GeoPoint): number => {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = radians(b.lat - a.lat);
  const dLng = radians(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(a.lat)) *
      Math.cos(radians(b.lat)) *
      Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, h)));
};
