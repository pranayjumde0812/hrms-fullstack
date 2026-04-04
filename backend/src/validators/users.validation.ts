import { z } from 'zod';

export const userIdParamSchema = z.object({
  id: z.coerce.number(),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['SUPER_ADMIN', 'HR_MANAGER', 'PROJECT_MANAGER', 'EMPLOYEE']),
  baseSalary: z.number().min(0).optional(),
  hourlyRate: z.number().min(0).optional(),
  joiningDate: z.string().transform((str) => new Date(str)),
  departmentId: z.coerce.number().optional(),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(['SUPER_ADMIN', 'HR_MANAGER', 'PROJECT_MANAGER', 'EMPLOYEE']).optional(),
  baseSalary: z.number().min(0).optional(),
  hourlyRate: z.number().min(0).optional(),
  departmentId: z.coerce.number().nullable().optional(),
});
