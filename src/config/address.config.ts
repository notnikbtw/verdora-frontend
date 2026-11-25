export const GEOCODING_URL = (
  import.meta.env.VITE_GEOCODING_URL || 'https://photon.komoot.io'
).replace(/\/$/, '');

export const ADDRESS_SEARCH_DELAY_MS = 600;
export const ADDRESS_SEARCH_MIN_LENGTH = 2;
