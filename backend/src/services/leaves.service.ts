import { Role } from '@prisma/client';
import { leavesRepository } from '../repositories';

export const listLeaves = (user: { id: number; role: Role }) => {
  const filter = ['SUPER_ADMIN', 'HR_MANAGER'].includes(user.role)
    ? {}
    : { userId: user.id };

  return leavesRepository.listLeaves(filter);
};

export const applyLeave = (data: { userId: number; type: 'SICK' | 'CASUAL' | 'PAID'; startDate: Date; endDate: Date; reason?: string }) => {
  return leavesRepository.createLeave(data);
};

export const updateStatus = (id: number, status: 'APPROVED' | 'REJECTED') => {
  return leavesRepository.updateLeaveStatus(id, status);
};
