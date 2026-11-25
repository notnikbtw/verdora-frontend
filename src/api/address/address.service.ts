import { z } from 'zod';
import { GEOCODING_URL } from '@/config/address.config';
import {
  settlementSchema,
  type AddressSuggestion,
  type GeoPoint,
  type Settlement,
} from '@/schemas/address.schema';
import { distanceKm, normalizeAddressText } from '@/utils/address.utils';

const responseSchema = z.object({
  features: z.array(
    z.object({
      geometry: z.object({
        coordinates: z.tuple([
          z.number().min(-180).max(180),
          z.number().min(-90).max(90),
        ]),
      }),
      properties: z.object({
        osm_type: z.string(),
        osm_id: z.union([z.string(), z.number()]),
        countrycode: z.string(),
        name: z.string().nullish(),
        city: z.string().nullish(),
        state: z.string().nullish(),
        county: z.string().nullish(),
        street: z.string().nullish(),
        housenumber: z.string().nullish(),
        osm_key: z.string().nullish(),
        osm_value: z.string().nullish(),
        extent: z.array(z.number()).length(4).nullish(),
      }),
    })
  ),
});
type Feature = z.infer<typeof responseSchema>['features'][number];

let queue: Promise<unknown> = Promise.resolve();
let lastRequestAt = 0;

const wait = (milliseconds: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }
    const aborted = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', aborted);
      resolve();
    }, milliseconds);
    signal.addEventListener('abort', aborted, { once: true });
  });

// Share a one-request-per-second queue across city and street search.
const request = (
  path: string,
  params: URLSearchParams,
  signal?: AbortSignal
) => {
  const requestSignal = AbortSignal.any([
    ...(signal ? [signal] : []),
    AbortSignal.timeout(12_000),
  ]);
  const task = queue.then(async () => {
    requestSignal.throwIfAborted();
    await wait(Math.max(0, 1000 - (Date.now() - lastRequestAt)), requestSignal);
    lastRequestAt = Date.now();
    const response = await fetch(`${GEOCODING_URL}/${path}?${params}`, {
      signal: requestSignal,
      credentials: 'omit',
    });
    if (!response.ok)
      throw new Error(
        'Address search is temporarily unavailable. Please try again.'
      );
    const parsed = responseSchema.safeParse(await response.json());
    if (!parsed.success)
      throw new Error(
        'Address search returned an unexpected response. Please try again.'
      );
    return parsed.data.features.filter(
      feature => feature.properties.countrycode.toUpperCase() === 'UA'
    );
  });
  queue = task.catch(() => undefined);
  return task;
};

const positionOf = (feature: Feature): GeoPoint => ({
  lng: feature.geometry.coordinates[0],
  lat: feature.geometry.coordinates[1],
});
const idOf = (feature: Feature) =>
  `${feature.properties.osm_type}:${feature.properties.osm_id}`;

const settlementOf = (feature: Feature): Settlement | null => {
  const p = feature.properties;
  if (
    p.osm_key !== 'place' ||
    !['city', 'town', 'village', 'hamlet'].includes(p.osm_value ?? '') ||
    !p.name
  )
    return null;
  const bounds = p.extent
    ? [
        Math.min(p.extent[0], p.extent[2]),
        Math.min(p.extent[1], p.extent[3]),
        Math.max(p.extent[0], p.extent[2]),
        Math.max(p.extent[1], p.extent[3]),
      ]
    : undefined;
  const parsed = settlementSchema.safeParse({
    id: idOf(feature),
    name: p.name,
    label: [...new Set([p.name, p.county, p.state].filter(Boolean))].join(', '),
    region: p.state ?? undefined,
    countryCode: 'UA',
    position: positionOf(feature),
    bounds,
  });
  return parsed.success ? parsed.data : null;
};

const settlementParams = (query: string) => {
  const params = new URLSearchParams({
    q: query,
    countrycode: 'UA',
    limit: '8',
  });
  for (const type of ['city', 'town', 'village', 'hamlet'])
    params.append('osm_tag', `place:${type}`);
  return params;
};

export const addressService = {
  searchSettlements: async (
    query: string,
    signal?: AbortSignal
  ): Promise<Settlement[]> => {
    const features = await request('api/', settlementParams(query), signal);
    return [
      ...new Map(
        features
          .map(settlementOf)
          .filter((item): item is Settlement => Boolean(item))
          .map(item => [item.id, item])
      ).values(),
    ];
  },
  searchStreets: async (
    query: string,
    settlement: Settlement,
    signal?: AbortSignal
  ): Promise<AddressSuggestion[]> => {
    const params = new URLSearchParams({
      q: `${settlement.name} ${query}`,
      countrycode: 'UA',
      limit: '8',
      osm_tag: 'highway',
      lat: String(settlement.position.lat),
      lon: String(settlement.position.lng),
    });
    if (settlement.bounds) params.set('bbox', settlement.bounds.join(','));
    const features = await request('api/', params, signal);
    const results: AddressSuggestion[] = [];
    for (const feature of features) {
      const p = feature.properties;
      const street = p.street || p.name;
      if (
        !street ||
        (p.city &&
          normalizeAddressText(p.city) !==
            normalizeAddressText(settlement.name))
      )
        continue;
      if (
        !settlement.bounds &&
        distanceKm(settlement.position, positionOf(feature)) > 25
      )
        continue;
      if (
        results.some(
          item =>
            normalizeAddressText(item.street) === normalizeAddressText(street)
        )
      )
        continue;
      results.push({
        id: idOf(feature),
        street,
        label: street,
      });
    }
    return results;
  },
};
