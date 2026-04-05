import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';

type AttendancePolicyId = NonNullable<Prisma.AttendancePolicyWhereUniqueInput['id']>;
type AttendancePolicyCreateData = Prisma.AttendancePolicyCreateInput;
type AttendancePolicyUpdateData = Prisma.AttendancePolicyUpdateInput;

export const listAttendancePolicies = () => {
  return prisma.attendancePolicy.findMany({
    include: {
      workLocation: { select: { id: true, name: true, code: true, timeZone: true } },
    },
    orderBy: [{ isActive: 'desc' }, { effectiveFrom: 'desc' }],
  });
};

export const findAttendancePolicyById = (id: AttendancePolicyId) => {
  return prisma.attendancePolicy.findUnique({ where: { id } });
};

export const findAttendancePolicyByName = (name: string) => {
  return prisma.attendancePolicy.findUnique({ where: { name } });
};

export const findActiveAttendancePolicyForDate = (date: Date, workLocationId?: number | null) => {
  return prisma.attendancePolicy.findFirst({
    where: {
      isActive: true,
      effectiveFrom: { lte: date },
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: date } }],
      workLocationId: workLocationId ?? null,
    },
    orderBy: { effectiveFrom: 'desc' },
  });
};

export const createAttendancePolicy = (data: AttendancePolicyCreateData) => {
  return prisma.attendancePolicy.create({
    data,
    include: {
      workLocation: { select: { id: true, name: true, code: true, timeZone: true } },
    },
  });
};

export const updateAttendancePolicy = (id: AttendancePolicyId, data: AttendancePolicyUpdateData) => {
  return prisma.attendancePolicy.update({
    where: { id },
    data,
    include: {
      workLocation: { select: { id: true, name: true, code: true, timeZone: true } },
    },
  });
};

export const deleteAttendancePolicy = (id: AttendancePolicyId) => {
  return prisma.attendancePolicy.delete({ where: { id } });
};
