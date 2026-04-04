import { AttendanceRegularizationStatus, Prisma } from '@prisma/client';
import prisma from '../utils/prisma';

type RegularizationId = NonNullable<Prisma.AttendanceRegularizationWhereUniqueInput['id']>;
type UserId = NonNullable<Prisma.UserWhereUniqueInput['id']>;

const includeConfig = {
  user: { select: { id: true, firstName: true, lastName: true, role: true, managerId: true } },
  reviewer: { select: { id: true, firstName: true, lastName: true, role: true } },
} as const;

export const createRegularization = (data: Prisma.AttendanceRegularizationUncheckedCreateInput) => {
  return prisma.attendanceRegularization.create({
    data,
    include: includeConfig,
  });
};

export const findRegularizationById = (id: RegularizationId) => {
  return prisma.attendanceRegularization.findUnique({
    where: { id },
    include: includeConfig,
  });
};

export const findPendingRegularizationForDate = (userId: UserId, attendanceDate: Date) => {
  return prisma.attendanceRegularization.findFirst({
    where: {
      userId,
      attendanceDate,
      status: 'PENDING',
    },
  });
};

export const listRegularizationsForUser = (userId: UserId) => {
  return prisma.attendanceRegularization.findMany({
    where: { userId },
    include: includeConfig,
    orderBy: { createdAt: 'desc' },
  });
};

export const listRegularizationsForReview = (reviewerId: UserId, elevated: boolean) => {
  return prisma.attendanceRegularization.findMany({
    where: elevated
      ? {}
      : {
          user: {
            managerId: reviewerId,
          },
        },
    include: includeConfig,
    orderBy: [
      { status: 'asc' as Prisma.SortOrder },
      { createdAt: 'desc' as Prisma.SortOrder },
    ],
  });
};

export const updateRegularization = (
  id: RegularizationId,
  data: Prisma.AttendanceRegularizationUncheckedUpdateInput,
) => {
  return prisma.attendanceRegularization.update({
    where: { id },
    data,
    include: includeConfig,
  });
};
