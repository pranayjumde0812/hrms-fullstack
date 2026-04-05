import { z } from 'zod';

export const attendancePolicyIdParamSchema = z.object({
  id: z.coerce.number(),
});

const attendancePolicyBaseSchema = z.object({
  name: z.string().min(1).max(120),
  workLocationId: z.coerce.number().nullable().optional(),
  standardWorkingHours: z.number().positive(),
  lateAfterMinutes: z.number().int().min(0),
  halfDayAfterMinutes: z.number().int().min(0),
  halfDayMinWorkingHours: z.number().positive(),
  graceMinutes: z.number().int().min(0).optional(),
  overtimeAllowed: z.boolean().optional(),
  autoAbsentEnabled: z.boolean().optional(),
  effectiveFrom: z.string().transform((str) => new Date(str)),
  effectiveTo: z.string().optional().transform((str) => (str ? new Date(str) : undefined)),
  isActive: z.boolean().optional(),
});

export const attendancePolicyCreateSchema = attendancePolicyBaseSchema;

export const attendancePolicyUpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  workLocationId: z.coerce.number().nullable().optional(),
  standardWorkingHours: z.number().positive().optional(),
  lateAfterMinutes: z.number().int().min(0).optional(),
  halfDayAfterMinutes: z.number().int().min(0).optional(),
  halfDayMinWorkingHours: z.number().positive().optional(),
  graceMinutes: z.number().int().min(0).optional(),
  overtimeAllowed: z.boolean().optional(),
  autoAbsentEnabled: z.boolean().optional(),
  effectiveFrom: z.string().optional().transform((str) => (str ? new Date(str) : undefined)),
  effectiveTo: z.string().nullable().optional().transform((str) => (str ? new Date(str) : str === null ? null : undefined)),
  isActive: z.boolean().optional(),
});
