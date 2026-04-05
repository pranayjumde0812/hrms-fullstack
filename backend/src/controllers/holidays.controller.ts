import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { holidaysService } from '../services';
import { asyncHandler } from '../utils/http';

export const getHolidaysHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { month, year } = req.query as unknown as { month?: number; year?: number };
  const holidays = await holidaysService.listHolidays({ month, year });
  res.json({ success: true, message: 'Holidays retrieved', data: holidays });
});

export const createHolidayHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const holiday = await holidaysService.createHoliday(req.body);
  res.json({ success: true, message: 'Holiday created', data: holiday });
});

export const deleteHolidayHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  await holidaysService.deleteHoliday(id);
  res.json({ success: true, message: 'Holiday deleted', data: null });
});
