import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';

type HolidayId = NonNullable<Prisma.HolidayWhereUniqueInput['id']>;

export const listHolidays = (from?: Date, to?: Date) => {
  return prisma.holiday.findMany({
    where:
      from && to
        ? {
            holidayDate: {
              gte: from,
              lte: to,
            },
          }
        : undefined,
    include: {
      workLocation: { select: { id: true, name: true, code: true } },
    },
    orderBy: { holidayDate: 'asc' },
  });
};

export const findHolidayByDate = (holidayDate: Date, workLocationId?: number | null) => {
  return prisma.holiday.findFirst({
    where: {
      holidayDate,
      OR: [{ workLocationId: null }, { workLocationId: workLocationId ?? null }],
    },
    orderBy: { workLocationId: 'desc' },
  });
};

export const createHoliday = (data: Prisma.HolidayCreateInput) => {
  return prisma.holiday.create({ data });
};

export const deleteHoliday = (id: HolidayId) => {
  return prisma.holiday.delete({
    where: { id },
  });
};
