import { z } from 'zod';

export const timesheetIdParamSchema = z.object({
  id: z.coerce.number(),
});

export const logTimesheetSchema = z.object({
  projectId: z.coerce.number(),
  date: z.string().transform((str) => new Date(str)),
  hours: z.number().min(0.5).max(24),
  notes: z.string().optional(),
});

export const timesheetStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
});
