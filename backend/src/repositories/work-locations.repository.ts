import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';

type WorkLocationId = NonNullable<Prisma.WorkLocationWhereUniqueInput['id']>;
type WorkLocationCreateData = Prisma.WorkLocationCreateInput;
type WorkLocationUpdateData = Prisma.WorkLocationUpdateInput;

export const listWorkLocations = () => {
  return prisma.workLocation.findMany({
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    include: {
      _count: {
        select: {
          users: true,
          attendancePolicies: true,
        },
      },
    },
  });
};

export const findWorkLocationById = (id: WorkLocationId) => {
  return prisma.workLocation.findUnique({ where: { id } });
};

export const findWorkLocationByName = (name: string) => {
  return prisma.workLocation.findUnique({ where: { name } });
};

export const findWorkLocationByCode = (code: string) => {
  return prisma.workLocation.findUnique({ where: { code } });
};

export const createWorkLocation = (data: WorkLocationCreateData) => {
  return prisma.workLocation.create({ data });
};

export const updateWorkLocation = (id: WorkLocationId, data: WorkLocationUpdateData) => {
  return prisma.workLocation.update({ where: { id }, data });
};

export const deleteWorkLocation = (id: WorkLocationId) => {
  return prisma.workLocation.delete({ where: { id } });
};
