import { Prisma, Role } from '@prisma/client';
import prisma from '../utils/prisma';

type UserId = NonNullable<Prisma.UserWhereUniqueInput['id']>;

export type CreateUserData = {
  employeeCode?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  designation?: string;
  employmentType?: Prisma.UserCreateInput['employmentType'];
  lifecycleStatus?: Prisma.UserCreateInput['lifecycleStatus'];
  baseSalary?: number;
  hourlyRate?: number;
  joiningDate: Date;
  confirmationDate?: Date;
  exitDate?: Date;
  timeZone?: string;
  departmentId?: number;
  managerId?: number | null;
  workLocationId?: number | null;
};

export type UpdateUserData = {
  employeeCode?: string | null;
  firstName?: string;
  lastName?: string;
  role?: Role;
  designation?: string | null;
  employmentType?: Prisma.UserUpdateInput['employmentType'];
  lifecycleStatus?: Prisma.UserUpdateInput['lifecycleStatus'];
  baseSalary?: number;
  hourlyRate?: number;
  joiningDate?: Date;
  confirmationDate?: Date | null;
  exitDate?: Date | null;
  timeZone?: string | null;
  departmentId?: number | null;
  managerId?: number | null;
  workLocationId?: number | null;
};

const userSummarySelect = {
  id: true,
  employeeCode: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  designation: true,
  employmentType: true,
  lifecycleStatus: true,
  baseSalary: true,
  hourlyRate: true,
  joiningDate: true,
  confirmationDate: true,
  exitDate: true,
  timeZone: true,
  departmentId: true,
  managerId: true,
  workLocationId: true,
  department: { select: { name: true } },
  manager: { select: { id: true, firstName: true, lastName: true, role: true } },
  workLocation: { select: { id: true, name: true, code: true, timeZone: true } },
  createdAt: true,
} satisfies Prisma.UserSelect;

export const listUsers = () => {
  return prisma.user.findMany({ select: userSummarySelect });
};

export const findUserByEmail = (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

export const findUserByEmployeeCode = (employeeCode: string) => {
  return prisma.user.findUnique({ where: { employeeCode } });
};

export const createUser = (data: CreateUserData) => {
  return prisma.user.create({ data });
};

export const findUserByIdWithDepartment = (id: UserId) => {
  return prisma.user.findUnique({
    where: { id },
    include: {
      department: true,
      manager: { select: { id: true, firstName: true, lastName: true, role: true } },
      workLocation: true,
    },
  });
};

export const findUserById = (id: UserId) => {
  return prisma.user.findUnique({ where: { id } });
};

export const updateUser = (id: UserId, data: UpdateUserData) => {
  return prisma.user.update({ where: { id }, data });
};

export const deleteUser = (id: UserId) => {
  return prisma.user.delete({ where: { id } });
};
