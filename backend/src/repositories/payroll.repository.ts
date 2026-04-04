import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';

type UserId = NonNullable<Prisma.UserWhereUniqueInput['id']>;

export const createPayroll = (data: {
  userId: UserId;
  month: number;
  year: number;
  baseAmount: number;
  hourlyAmount: number;
  deductions: number;
  netPay: number;
  paymentDate: Date;
}) => {
  return prisma.payroll.create({ data });
};

export const listPayrolls = (filter: Prisma.PayrollWhereInput) => {
  return prisma.payroll.findMany({
    where: filter,
    include: { user: { select: { firstName: true, lastName: true } } },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  });
};

export const sumNetPay = async () => {
  return prisma.payroll.aggregate({ _sum: { netPay: true } });
};
