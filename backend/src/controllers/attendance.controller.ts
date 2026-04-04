import { Response } from 'express';
import { WorkMode } from '@prisma/client';
import { AuthRequest } from '../middlewares/authMiddleware';
import { attendanceService } from '../services';
import { asyncHandler } from '../utils/http';
import { extractRequestMetadata } from '../utils/requestMetadata';

export const getMyAttendanceHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const attendance = await attendanceService.getMyAttendance(req.user!);
  res.json({ success: true, message: 'Attendance retrieved', data: attendance });
});

export const checkInHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { workMode, latitude, longitude } = req.body as {
    workMode: WorkMode;
    latitude?: number;
    longitude?: number;
  };
  const metadata = extractRequestMetadata(req);

  const attendance = await attendanceService.checkIn({
    userId: req.user!.id,
    role: req.user!.role,
    workMode,
    latitude,
    longitude,
    ...metadata,
  });

  res.json({ success: true, message: 'Checked in successfully', data: attendance });
});

export const checkOutHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { latitude, longitude } = req.body as {
    latitude?: number;
    longitude?: number;
  };
  const metadata = extractRequestMetadata(req);

  const attendance = await attendanceService.checkOut({
    userId: req.user!.id,
    role: req.user!.role,
    latitude,
    longitude,
    ...metadata,
  });

  res.json({ success: true, message: 'Checked out successfully', data: attendance });
});

export const getMonthlyAttendanceHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { month, year, userId } = req.query as unknown as {
    month?: number;
    year?: number;
    userId?: number;
  };

  const attendance = await attendanceService.getMonthlyAttendance({
    requester: req.user!,
    month,
    year,
    userId,
  });

  res.json({ success: true, message: 'Monthly attendance retrieved', data: attendance });
});

export const getViewableAttendanceUsersHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const users = await attendanceService.listAttendanceViewableUsers(req.user!);
  res.json({ success: true, message: 'Attendance users retrieved', data: users });
});
