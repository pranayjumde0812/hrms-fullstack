import { z } from 'zod';

export const weeklyOffRuleIdParamSchema = z.object({
  id: z.coerce.number(),
});

const baseSchema = z.object({
  name: z.string().min(1).max(120),
  workLocationId: z.coerce.number().nullable().optional(),
  weekDay: z.number().int().min(0).max(6),
  weekNumberInMonth: z.number().int().min(1).max(5).nullable().optional(),
  isActive: z.boolean().optional(),
  effectiveFrom: z.string().transform((str) => new Date(str)),
  effectiveTo: z.string().optional().transform((str) => (str ? new Date(str) : undefined)),
});

export const weeklyOffRuleCreateSchema = baseSchema;

export const weeklyOffRuleUpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  workLocationId: z.coerce.number().nullable().optional(),
  weekDay: z.number().int().min(0).max(6).optional(),
  weekNumberInMonth: z.number().int().min(1).max(5).nullable().optional(),
  isActive: z.boolean().optional(),
  effectiveFrom: z.string().optional().transform((str) => (str ? new Date(str) : undefined)),
  effectiveTo: z.string().nullable().optional().transform((str) => (str ? new Date(str) : str === null ? null : undefined)),
});
