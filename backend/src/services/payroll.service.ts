import { Role } from '@prisma/client';
import { payrollRepository, timesheetsRepository, usersRepository } from '../repositories';
import { AppError } from '../utils/http';

export const generatePayroll = async (userId: number, month: number, year: number) => {
  const user = await usersRepository.findUserByIdWithDepartment(userId);

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  const timesheets = await timesheetsRepository.findApprovedTimesheetsForPeriod(userId, startDate, endDate);

  const totalHours = timesheets.reduce((acc, entry) => acc + entry.hours, 0);
  const hourlyAmount = totalHours * user.hourlyRate;
  const baseAmount = user.baseSalary;
  const gross = baseAmount + hourlyAmount;
  const deductions = gross * 0.1;
  const netPay = gross - deductions;

  return payrollRepository.createPayroll({
    userId,
    month,
    year,
    baseAmount,
    hourlyAmount,
    deductions,
    netPay,
    paymentDate: new Date(),
  });
};

export const listPayrolls = (user: { id: number; role: Role }) => {
  const filter = ['SUPER_ADMIN', 'HR_MANAGER'].includes(user.role)
    ? {}
    : { userId: user.id };

  return payrollRepository.listPayrolls(filter);
};
