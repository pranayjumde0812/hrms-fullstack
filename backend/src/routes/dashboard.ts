import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();
router.use(authenticate);

// Get dashboard stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [totalEmployees, activeProjects, pendingTimesheets, payrollAgg] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.timesheet.count({ where: { status: 'PENDING' } }),
      prisma.payroll.aggregate({ _sum: { netPay: true } })
    ]);

    const pendingLeaves = await prisma.leave.count({ where: { status: 'PENDING' } });
    const totalDepartments = await prisma.department.count();

    res.json({
      success: true,
      message: 'Dashboard stats retrieved',
      data: {
        totalEmployees,
        activeProjects,
        pendingTimesheets,
        totalPayroll: payrollAgg._sum.netPay || 0,
        pendingLeaves,
        totalDepartments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching stats', data: null });
  }
});

export default router;
