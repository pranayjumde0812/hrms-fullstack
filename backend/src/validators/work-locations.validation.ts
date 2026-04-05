import { z } from 'zod';

export const workLocationIdParamSchema = z.object({
  id: z.coerce.number(),
});

export const workLocationCreateSchema = z.object({
  name: z.string().min(1).max(120),
  code: z.string().min(1).max(40),
  timeZone: z.string().min(1).max(120),
  address: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

export const workLocationUpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  code: z.string().min(1).max(40).optional(),
  timeZone: z.string().min(1).max(120).optional(),
  address: z.string().max(500).nullable().optional(),
  isActive: z.boolean().optional(),
});
