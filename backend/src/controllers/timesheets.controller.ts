import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { timesheetsService } from '../services';
import { asyncHandler } from '../utils/http';

export const getTimesheets = asyncHandler(async (req: AuthRequest, res: Response) => {
  const timesheets = await timesheetsService.listTimesheets(req.user!);
  res.json({ success: true, message: 'Timesheets retrieved', data: timesheets });
});

export const createTimesheetHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const timesheet = await timesheetsService.logTimesheet({ ...req.body, userId: req.user!.id });
  res.json({ success: true, message: 'Timesheet logged', data: timesheet });
});

export const updateTimesheetStatusHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  const { status } = req.body as { status: 'APPROVED' | 'REJECTED' };
  const timesheet = await timesheetsService.updateStatus(id, status);
  res.json({ success: true, message: `Timesheet ${status.toLowerCase()}`, data: timesheet });
});
