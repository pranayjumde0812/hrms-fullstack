import { z } from 'zod';

const optionalTimeString = z.string().regex(/^\d{2}:\d{2}$/).optional();

export const attendanceRegularizationCreateSchema = z.object({
  attendanceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(['MISSED_CHECK_IN', 'MISSED_CHECK_OUT', 'FULL_CORRECTION', 'WORK_MODE_CORRECTION']),
  reason: z.string().min(5).max(500),
  requestedCheckInTime: optionalTimeString,
  requestedCheckOutTime: optionalTimeString,
  requestedWorkMode: z.enum(['WFH', 'OFFICE', 'OTHER']).optional(),
});

export const attendanceRegularizationReviewSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reviewNotes: z.string().max(500).optional(),
});
