import { weeklyOffRulesRepository, workLocationsRepository } from '../repositories';
import { AppError } from '../utils/http';

const validateWorkLocation = async (workLocationId?: number | null) => {
  if (workLocationId == null) {
    return;
  }

  const workLocation = await workLocationsRepository.findWorkLocationById(workLocationId);
  if (!workLocation) {
    throw new AppError(404, 'Work location not found');
  }
};

export const listWeeklyOffRules = () => weeklyOffRulesRepository.listWeeklyOffRules();

export const createWeeklyOffRule = async (data: {
  name: string;
  workLocationId?: number | null;
  weekDay: number;
  weekNumberInMonth?: number | null;
  isActive?: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date;
}) => {
  await validateWorkLocation(data.workLocationId);
  return weeklyOffRulesRepository.createWeeklyOffRule({
    ...data,
    workLocation: data.workLocationId != null ? { connect: { id: data.workLocationId } } : undefined,
  });
};

export const updateWeeklyOffRule = async (
  id: number,
  data: {
    name?: string;
    workLocationId?: number | null;
    weekDay?: number;
    weekNumberInMonth?: number | null;
    isActive?: boolean;
    effectiveFrom?: Date;
    effectiveTo?: Date | null;
  },
) => {
  const existing = await weeklyOffRulesRepository.findWeeklyOffRuleById(id);
  if (!existing) {
    throw new AppError(404, 'Weekly off rule not found');
  }

  await validateWorkLocation(data.workLocationId);

  return weeklyOffRulesRepository.updateWeeklyOffRule(id, {
    ...data,
    workLocation:
      data.workLocationId === undefined
        ? undefined
        : data.workLocationId === null
          ? { disconnect: true }
          : { connect: { id: data.workLocationId } },
  });
};

export const deleteWeeklyOffRule = async (id: number) => {
  const existing = await weeklyOffRulesRepository.findWeeklyOffRuleById(id);
  if (!existing) {
    throw new AppError(404, 'Weekly off rule not found');
  }

  return weeklyOffRulesRepository.deleteWeeklyOffRule(id);
};
