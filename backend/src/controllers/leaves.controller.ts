import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { leavesService } from '../services';
import { asyncHandler } from '../utils/http';

export const getLeaves = asyncHandler(async (req: AuthRequest, res: Response) => {
  const leaves = await leavesService.listLeaves(req.user!);
  res.json({ success: true, message: 'Leaves retrieved', data: leaves });
});

export const createLeaveHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const leave = await leavesService.applyLeave({ ...req.body, userId: req.user!.id });
  res.json({ success: true, message: 'Leave applied', data: leave });
});

export const updateLeaveStatusHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  const { status } = req.body as { status: 'APPROVED' | 'REJECTED' };
  const leave = await leavesService.updateStatus(id, status);
  res.json({ success: true, message: `Leave ${status.toLowerCase()}`, data: leave });
});
