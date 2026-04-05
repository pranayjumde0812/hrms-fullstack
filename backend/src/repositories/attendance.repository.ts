import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';

type UserId = NonNullable<Prisma.UserWhereUniqueInput['id']>;
type AttendanceId = NonNullable<Prisma.AttendanceWhereUniqueInput['id']>;

export const findAttendanceForDate = (userId: UserId, attendanceDate: Date) => {
  return prisma.attendance.findUnique({
    where: {
      userId_attendanceDate: {
        userId,
        attendanceDate,
      },
    },
  });
};

export const createAttendance = (data: Prisma.AttendanceUncheckedCreateInput) => {
  return prisma.attendance.create({ data });
};

export const updateAttendance = (id: AttendanceId, data: Prisma.AttendanceUncheckedUpdateInput) => {
  return prisma.attendance.update({
    where: { id },
    data,
  });
};

export const listAttendanceForUser = (userId: UserId, limit = 30) => {
  return prisma.attendance.findMany({
    where: { userId },
    orderBy: { checkInAt: 'desc' },
    take: limit,
  });
};

export const listAttendanceForUserInRange = (userId: UserId, from: Date, to: Date) => {
  return prisma.attendance.findMany({
    where: {
      userId,
      attendanceDate: {
        gte: from,
        lte: to,
      },
    },
    orderBy: { attendanceDate: 'asc' },
  });
};

export const listAttendanceForUsersOnDate = (userIds: UserId[], attendanceDate: Date) => {
  if (userIds.length === 0) {
    return Promise.resolve([]);
  }

  return prisma.attendance.findMany({
    where: {
      userId: {
        in: userIds,
      },
      attendanceDate,
    },
  });
};

export const findAttendanceById = (id: AttendanceId) => {
  return prisma.attendance.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          managerId: true,
          department: { select: { name: true } },
        },
      },
      overtimeReviewer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
  });
};

export const listOvertimeForReview = (reviewerId: UserId, elevated: boolean) => {
  return prisma.attendance.findMany({
    where: elevated
      ? {
          overtimeMinutes: {
            gt: 0,
          },
          overtimeStatus: 'PENDING',
        }
      : {
          overtimeMinutes: {
            gt: 0,
          },
          overtimeStatus: 'PENDING',
          user: {
            managerId: reviewerId,
          },
        },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          managerId: true,
          department: { select: { name: true } },
        },
      },
      overtimeReviewer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' as Prisma.SortOrder },
  });
};
