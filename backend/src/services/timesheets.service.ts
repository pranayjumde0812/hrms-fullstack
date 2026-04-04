import { Role } from '@prisma/client';
import { timesheetsRepository } from '../repositories';

export const listTimesheets = (user: { id: number; role: Role }) => {
  const filter = ['SUPER_ADMIN', 'HR_MANAGER', 'PROJECT_MANAGER'].includes(user.role)
    ? {}
    : { userId: user.id };

  return timesheetsRepository.listTimesheets(filter);
};

export const logTimesheet = (data: { userId: number; projectId: number; date: Date; hours: number; notes?: string }) => {
  return timesheetsRepository.createTimesheet(data);
};

export const updateStatus = (id: number, status: 'APPROVED' | 'REJECTED') => {
  return timesheetsRepository.updateTimesheetStatus(id, status);
};
