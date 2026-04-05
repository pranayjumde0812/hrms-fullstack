import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';

type WeeklyOffRuleId = NonNullable<Prisma.WeeklyOffRuleWhereUniqueInput['id']>;

export const listWeeklyOffRules = () => {
  return prisma.weeklyOffRule.findMany({
    include: {
      workLocation: { select: { id: true, name: true, code: true } },
    },
    orderBy: [{ isActive: 'desc' }, { weekDay: 'asc' }],
  });
};

export const listActiveWeeklyOffRulesForDate = (date: Date, workLocationId?: number | null) => {
  return prisma.weeklyOffRule.findMany({
    where: {
      isActive: true,
      effectiveFrom: { lte: date },
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: date } }],
      workLocationId: workLocationId ?? null,
    },
  });
};

export const createWeeklyOffRule = (data: Prisma.WeeklyOffRuleCreateInput) => prisma.weeklyOffRule.create({ data });
export const updateWeeklyOffRule = (id: WeeklyOffRuleId, data: Prisma.WeeklyOffRuleUpdateInput) =>
  prisma.weeklyOffRule.update({ where: { id }, data });
export const deleteWeeklyOffRule = (id: WeeklyOffRuleId) => prisma.weeklyOffRule.delete({ where: { id } });
export const findWeeklyOffRuleById = (id: WeeklyOffRuleId) => prisma.weeklyOffRule.findUnique({ where: { id } });
