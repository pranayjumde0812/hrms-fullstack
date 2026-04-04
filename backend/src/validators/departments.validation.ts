import { z } from 'zod';

export const departmentIdParamSchema = z.object({
  id: z.coerce.number(),
});

export const departmentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});
