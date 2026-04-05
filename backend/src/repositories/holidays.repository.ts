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
    orderBy: { holidayDate: 'asc' },
  });
};

export const findHolidayByDate = (holidayDate: Date) => {
  return prisma.holiday.findUnique({
    where: { holidayDate },
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
