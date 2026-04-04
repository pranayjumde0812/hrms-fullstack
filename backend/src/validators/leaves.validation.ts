import { z } from 'zod';

export const leaveIdParamSchema = z.object({
  id: z.coerce.number(),
});

export const applyLeaveSchema = z.object({
  type: z.enum(['SICK', 'CASUAL', 'PAID']),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  reason: z.string().optional(),
});

export const leaveStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
});
