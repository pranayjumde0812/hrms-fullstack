import { z } from 'zod';

export const userIdParamSchema = z.object({
  id: z.coerce.number(),
});

export const createUserSchema = z.object({
  employeeCode: z.string().min(1).max(50).optional(),
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['SUPER_ADMIN', 'HR_MANAGER', 'PROJECT_MANAGER', 'EMPLOYEE']),
  designation: z.string().min(1).max(120).optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'INTERN', 'CONTRACTOR', 'CONSULTANT']).optional(),
  lifecycleStatus: z.enum(['ACTIVE', 'PROBATION', 'NOTICE', 'EXITED']).optional(),
  baseSalary: z.number().min(0).optional(),
  hourlyRate: z.number().min(0).optional(),
  joiningDate: z.string().transform((str) => new Date(str)),
  confirmationDate: z.string().optional().transform((str) => (str ? new Date(str) : undefined)),
  exitDate: z.string().optional().transform((str) => (str ? new Date(str) : undefined)),
  timeZone: z.string().min(1).max(120).optional(),
  departmentId: z.coerce.number().optional(),
  managerId: z.coerce.number().nullable().optional(),
  workLocationId: z.coerce.number().nullable().optional(),
});

export const updateUserSchema = z.object({
  employeeCode: z.string().min(1).max(50).nullable().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(['SUPER_ADMIN', 'HR_MANAGER', 'PROJECT_MANAGER', 'EMPLOYEE']).optional(),
  designation: z.string().min(1).max(120).nullable().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'INTERN', 'CONTRACTOR', 'CONSULTANT']).optional(),
  lifecycleStatus: z.enum(['ACTIVE', 'PROBATION', 'NOTICE', 'EXITED']).optional(),
  baseSalary: z.number().min(0).optional(),
  hourlyRate: z.number().min(0).optional(),
  joiningDate: z.string().optional().transform((str) => (str ? new Date(str) : undefined)),
  confirmationDate: z.string().nullable().optional().transform((str) => (str ? new Date(str) : str === null ? null : undefined)),
  exitDate: z.string().nullable().optional().transform((str) => (str ? new Date(str) : str === null ? null : undefined)),
  timeZone: z.string().min(1).max(120).nullable().optional(),
  departmentId: z.coerce.number().nullable().optional(),
  managerId: z.coerce.number().nullable().optional(),
  workLocationId: z.coerce.number().nullable().optional(),
});
