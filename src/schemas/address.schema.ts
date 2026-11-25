import { z } from 'zod';

export const geoPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const settlementSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().trim().min(1).max(100),
  label: z.string().min(1).max(300),
  region: z.string().max(150).optional(),
  countryCode: z.literal('UA'),
  position: geoPointSchema,
  bounds: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
});

export type GeoPoint = z.infer<typeof geoPointSchema>;
export type Settlement = z.infer<typeof settlementSchema>;

export type AddressSuggestion = {
  id: string;
  label: string;
  street: string;
};
