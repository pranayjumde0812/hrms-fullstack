import { z } from 'zod';

export const generatePayrollSchema = z.object({
  userId: z.coerce.number(),
  month: z.number().min(1).max(12),
  year: z.number().min(2000),
});
