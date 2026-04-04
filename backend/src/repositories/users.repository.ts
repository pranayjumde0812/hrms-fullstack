import { Prisma, Role } from '@prisma/client';
import prisma from '../utils/prisma';

type UserId = NonNullable<Prisma.UserWhereUniqueInput['id']>;

export type CreateUserData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  baseSalary?: number;
  hourlyRate?: number;
  joiningDate: Date;
  departmentId?: number;
};

export type UpdateUserData = {
  firstName?: string;
  lastName?: string;
  role?: Role;
  baseSalary?: number;
  hourlyRate?: number;
  departmentId?: number | null;
};

const userSummarySelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  baseSalary: true,
  hourlyRate: true,
  joiningDate: true,
  departmentId: true,
  department: { select: { name: true } },
  createdAt: true,
} satisfies Prisma.UserSelect;

export const listUsers = () => {
  return prisma.user.findMany({ select: userSummarySelect });
};

export const findUserByEmail = (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

export const createUser = (data: CreateUserData) => {
  return prisma.user.create({ data });
};

export const findUserByIdWithDepartment = (id: UserId) => {
  return prisma.user.findUnique({ where: { id }, include: { department: true } });
};

export const updateUser = (id: UserId, data: UpdateUserData) => {
  return prisma.user.update({ where: { id }, data });
};

export const deleteUser = (id: UserId) => {
  return prisma.user.delete({ where: { id } });
};
