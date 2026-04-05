import { attendancePoliciesRepository, workLocationsRepository } from '../repositories';
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

export const listAttendancePolicies = () => {
  return attendancePoliciesRepository.listAttendancePolicies();
};

export const createAttendancePolicy = async (data: {
  name: string;
  workLocationId?: number | null;
  standardWorkingHours: number;
  lateAfterMinutes: number;
  halfDayAfterMinutes: number;
  halfDayMinWorkingHours: number;
  graceMinutes?: number;
  overtimeAllowed?: boolean;
  autoAbsentEnabled?: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date;
  isActive?: boolean;
}) => {
  const existing = await attendancePoliciesRepository.findAttendancePolicyByName(data.name);
  if (existing) {
    throw new AppError(400, 'Attendance policy name already exists');
  }

  await validateWorkLocation(data.workLocationId);

  return attendancePoliciesRepository.createAttendancePolicy(data);
};

export const updateAttendancePolicy = async (
  id: number,
  data: {
    name?: string;
    workLocationId?: number | null;
    standardWorkingHours?: number;
    lateAfterMinutes?: number;
    halfDayAfterMinutes?: number;
    halfDayMinWorkingHours?: number;
    graceMinutes?: number;
    overtimeAllowed?: boolean;
    autoAbsentEnabled?: boolean;
    effectiveFrom?: Date;
    effectiveTo?: Date | null;
    isActive?: boolean;
  },
) => {
  const existing = await attendancePoliciesRepository.findAttendancePolicyById(id);

  if (!existing) {
    throw new AppError(404, 'Attendance policy not found');
  }

  if (data.name && data.name !== existing.name) {
    const conflict = await attendancePoliciesRepository.findAttendancePolicyByName(data.name);
    if (conflict) {
      throw new AppError(400, 'Attendance policy name already exists');
    }
  }

  await validateWorkLocation(data.workLocationId);

  return attendancePoliciesRepository.updateAttendancePolicy(id, data);
};

export const deleteAttendancePolicy = async (id: number) => {
  const existing = await attendancePoliciesRepository.findAttendancePolicyById(id);

  if (!existing) {
    throw new AppError(404, 'Attendance policy not found');
  }

  return attendancePoliciesRepository.deleteAttendancePolicy(id);
};
