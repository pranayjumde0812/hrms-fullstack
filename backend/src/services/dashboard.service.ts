import { dashboardRepository, leavesRepository, payrollRepository, timesheetsRepository } from '../repositories';

export const getStats = async () => {
  const [totalEmployees, activeProjects, pendingTimesheets, payrollAgg, pendingLeaves, totalDepartments] = await Promise.all([
    dashboardRepository.countUsers(),
    dashboardRepository.countProjects(),
    timesheetsRepository.countPendingTimesheets(),
    payrollRepository.sumNetPay(),
    leavesRepository.countPendingLeaves(),
    dashboardRepository.countDepartments(),
  ]);

  return {
    totalEmployees,
    activeProjects,
    pendingTimesheets,
    totalPayroll: payrollAgg._sum.netPay || 0,
    pendingLeaves,
    totalDepartments,
  };
};
