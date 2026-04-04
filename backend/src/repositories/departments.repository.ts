import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';

type DepartmentId = NonNullable<Prisma.DepartmentWhereUniqueInput['id']>;
type DepartmentCreateData = Prisma.DepartmentCreateInput;
type DepartmentUpdateData = Prisma.DepartmentUpdateInput;

export const listDepartments = () => {
  return prisma.department.findMany({
    include: { _count: { select: { users: true } } },
  });
};

export const findDepartmentByName = (name: string) => {
  return prisma.department.findUnique({ where: { name } });
};

export const createDepartment = (data: DepartmentCreateData) => {
  return prisma.department.create({ data });
};

export const updateDepartment = (id: DepartmentId, data: DepartmentUpdateData) => {
  return prisma.department.update({ where: { id }, data });
};

export const deleteDepartment = (id: DepartmentId) => {
  return prisma.department.delete({ where: { id } });
};
