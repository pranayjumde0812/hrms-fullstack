import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';

type LeaveId = NonNullable<Prisma.LeaveWhereUniqueInput['id']>;
type UserId = NonNullable<Prisma.UserWhereUniqueInput['id']>;

export const listLeaves = (filter: Prisma.LeaveWhereInput) => {
  return prisma.leave.findMany({
    where: filter,
    include: { user: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

export const createLeave = (data: { userId: UserId; type: 'SICK' | 'CASUAL' | 'PAID'; startDate: Date; endDate: Date; reason?: string }) => {
  return prisma.leave.create({ data });
};

export const updateLeaveStatus = (id: LeaveId, status: 'APPROVED' | 'REJECTED') => {
  return prisma.leave.update({ where: { id }, data: { status } });
};

export const countPendingLeaves = async () => {
  return prisma.leave.count({ where: { status: 'PENDING' } });
};
