import { z } from 'zod';

export const projectIdParamSchema = z.object({
  id: z.coerce.number(),
});

export const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().optional().transform((str) => (str ? new Date(str) : undefined)),
});

export const assignUsersSchema = z.object({
  userIds: z.array(z.coerce.number()),
});
