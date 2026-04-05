import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { attendancePoliciesService } from '../services';
import { asyncHandler } from '../utils/http';

export const getAttendancePolicies = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const attendancePolicies = await attendancePoliciesService.listAttendancePolicies();
  res.json({ success: true, message: 'Attendance policies retrieved', data: attendancePolicies });
});

export const createAttendancePolicyHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const attendancePolicy = await attendancePoliciesService.createAttendancePolicy(req.body);
  res.json({ success: true, message: 'Attendance policy created', data: attendancePolicy });
});

export const updateAttendancePolicyHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  const attendancePolicy = await attendancePoliciesService.updateAttendancePolicy(id, req.body);
  res.json({ success: true, message: 'Attendance policy updated', data: attendancePolicy });
});

export const deleteAttendancePolicyHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  await attendancePoliciesService.deleteAttendancePolicy(id);
  res.json({ success: true, message: 'Attendance policy deleted', data: null });
});
