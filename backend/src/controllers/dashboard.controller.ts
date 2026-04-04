import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { dashboardService } from '../services';
import { asyncHandler } from '../utils/http';

export const getDashboardStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const stats = await dashboardService.getStats();
  res.json({ success: true, message: 'Dashboard stats retrieved', data: stats });
});
