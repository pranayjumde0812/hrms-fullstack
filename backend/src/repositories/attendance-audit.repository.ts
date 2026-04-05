import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';

export const createAuditLogs = (data: Prisma.AttendanceAuditLogCreateManyInput[]) => {
  if (data.length === 0) {
    return Promise.resolve({ count: 0 });
  }

  return prisma.attendanceAuditLog.createMany({ data });
};
