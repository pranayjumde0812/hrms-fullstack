import { z } from 'zod';

const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const attendanceCheckInSchema = coordinatesSchema.extend({
  workMode: z.enum(['WFH', 'OFFICE', 'OTHER']),
});

export const attendanceCheckOutSchema = coordinatesSchema;

export const attendanceMonthlyQuerySchema = z.object({
  month: z.coerce.number().min(1).max(12).optional(),
  year: z.coerce.number().min(2000).max(3000).optional(),
  userId: z.coerce.number().optional(),
});
