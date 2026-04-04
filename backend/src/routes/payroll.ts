import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();
router.use(authenticate);

// Generate payroll
const generatePayrollSchema = z.object({
  userId: z.coerce.number(),
  month: z.number().min(1).max(12),
  year: z.number().min(2000)
});

router.post('/generate', authorize(['SUPER_ADMIN', 'HR_MANAGER']), async (req: Request, res: Response) => {
  try {
    const { userId, month, year } = generatePayrollSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found', data: null });

    // Calculate dates for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const timesheets = await prisma.timesheet.findMany({
      where: {
        userId,
        status: 'APPROVED',
        date: { gte: startDate, lte: endDate }
      }
    });

    const totalHours = timesheets.reduce((acc, t) => acc + t.hours, 0);
    const hourlyAmount = totalHours * user.hourlyRate;
    const baseAmount = user.baseSalary;
    
    // Simplistic deduction (e.g. 10% tax)
    const gross = baseAmount + hourlyAmount;
    const deductions = gross * 0.10;
    const netPay = gross - deductions;

    const payroll = await prisma.payroll.create({
      data: {
        userId,
        month,
        year,
        baseAmount,
        hourlyAmount,
        deductions,
        netPay,
        paymentDate: new Date()
      }
    });

    res.json({ success: true, message: 'Payroll generated', data: payroll });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation error', data: error.errors });
    }
    res.status(500).json({ success: false, message: 'Internal server error', data: null });
  }
});

// Get payrolls
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;
    
    const filter = ['SUPER_ADMIN', 'HR_MANAGER'].includes(role) 
      ? {} 
      : { userId };

    const payrolls = await prisma.payroll.findMany({
      where: filter,
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    });
    
    res.json({ success: true, message: 'Payrolls retrieved', data: payrolls });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching payrolls', data: null });
  }
});

export default router;
