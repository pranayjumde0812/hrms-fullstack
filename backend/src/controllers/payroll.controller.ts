import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { payrollService } from '../services';
import { asyncHandler } from '../utils/http';
export const generatePayrollHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userId, month, year } = req.body as { userId: number; month: number; year: number };
  const payroll = await payrollService.generatePayroll(userId, month, year);
  res.json({ success: true, message: 'Payroll generated', data: payroll });
});

export const getPayrolls = asyncHandler(async (req: AuthRequest, res: Response) => {
  const payrolls = await payrollService.listPayrolls(req.user!);
  res.json({ success: true, message: 'Payrolls retrieved', data: payrolls });
});
