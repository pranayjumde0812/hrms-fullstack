import { z } from 'zod';

export const holidayIdParamSchema = z.object({
  id: z.coerce.number(),
});

export const holidayQuerySchema = z.object({
  month: z.coerce.number().min(1).max(12).optional(),
  year: z.coerce.number().min(2000).max(3000).optional(),
});

export const holidayCreateSchema = z.object({
  name: z.string().min(1).max(120),
  holidayDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  workLocationId: z.coerce.number().nullable().optional(),
  isOptional: z.boolean().optional(),
  description: z.string().max(500).optional(),
});
