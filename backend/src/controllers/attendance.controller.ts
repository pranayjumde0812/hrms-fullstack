import { Response } from 'express';
import { AttendanceOvertimeStatus, AttendanceRegularizationStatus, AttendanceRegularizationType, WorkMode } from '@prisma/client';
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

export const getRegularizationsHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const regularizations = await attendanceService.getRegularizations(req.user!);
  res.json({ success: true, message: 'Attendance regularizations retrieved', data: regularizations });
});

export const createRegularizationHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    attendanceDate,
    type,
    reason,
    requestedCheckInTime,
    requestedCheckOutTime,
    requestedWorkMode,
  } = req.body as {
    attendanceDate: string;
    type: AttendanceRegularizationType;
    reason: string;
    requestedCheckInTime?: string;
    requestedCheckOutTime?: string;
    requestedWorkMode?: WorkMode;
  };

  const regularization = await attendanceService.createRegularization({
    userId: req.user!.id,
    role: req.user!.role,
    attendanceDate,
    type,
    reason,
    requestedCheckInTime,
    requestedCheckOutTime,
    requestedWorkMode,
  });

  res.json({ success: true, message: 'Attendance regularization requested', data: regularization });
});

export const reviewRegularizationHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  const { status, reviewNotes } = req.body as {
    status: AttendanceRegularizationStatus;
    reviewNotes?: string;
  };

  const regularization = await attendanceService.reviewRegularization({
    requestId: id,
    reviewer: req.user!,
    status,
    reviewNotes,
  });

  res.json({ success: true, message: 'Attendance regularization reviewed', data: regularization });
});

export const reviewOvertimeHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  const { status, reviewNotes } = req.body as {
    status: AttendanceOvertimeStatus;
    reviewNotes?: string;
  };

  const attendance = await attendanceService.reviewOvertime({
    attendanceId: id,
    reviewer: req.user!,
    status,
    reviewNotes,
  });

  res.json({ success: true, message: 'Attendance overtime reviewed', data: attendance });
});
