import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';

type TimesheetId = NonNullable<Prisma.TimesheetWhereUniqueInput['id']>;
type UserId = NonNullable<Prisma.UserWhereUniqueInput['id']>;
type ProjectId = NonNullable<Prisma.ProjectWhereUniqueInput['id']>;

export const listTimesheets = (filter: Record<string, unknown>) => {
  return prisma.timesheet.findMany({
    where: filter,
    include: {
      project: { select: { name: true } },
      user: { select: { firstName: true, lastName: true } },
    },
    orderBy: { date: 'desc' },
  });
};

export const createTimesheet = (data: { userId: UserId; projectId: ProjectId; date: Date; hours: number; notes?: string }) => {
  return prisma.timesheet.create({ data });
};

export const updateTimesheetStatus = (id: TimesheetId, status: 'APPROVED' | 'REJECTED') => {
  return prisma.timesheet.update({ where: { id }, data: { status } });
};

export const findApprovedTimesheetsForPeriod = (userId: UserId, startDate: Date, endDate: Date) => {
  return prisma.timesheet.findMany({
    where: {
      userId,
      status: 'APPROVED',
      date: { gte: startDate, lte: endDate },
    },
  });
};

export const countPendingTimesheets = async () => {
  return prisma.timesheet.count({ where: { status: 'PENDING' } });
};
