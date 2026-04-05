import { z } from 'zod';

const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const attendanceCheckInSchema = coordinatesSchema.extend({
  workMode: z.enum(['WFH', 'OFFICE', 'OTHER']),
});

export const attendanceCheckOutSchema = coordinatesSchema;

export const attendanceMonthlyQuerySchema = z.object({
  month: z.coerce.number().min(1).max(12).optional(),
  year: z.coerce.number().min(2000).max(3000).optional(),
  userId: z.coerce.number().optional(),
});

export const attendanceOvertimeReviewSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reviewNotes: z.string().max(500).optional(),
});

const optionalTimeString = z.string().regex(/^\d{2}:\d{2}$/).optional();

export const attendanceManualCorrectionSchema = z
  .object({
    userId: z.coerce.number(),
    attendanceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    workMode: z.enum(['WFH', 'OFFICE', 'OTHER']).optional(),
    checkInTime: optionalTimeString,
    checkOutTime: optionalTimeString,
    remarks: z.string().max(500).optional(),
    correctionReason: z.string().min(5).max(500),
  })
  .refine(
    (value) => {
      if (value.checkOutTime && !value.checkInTime) {
        return false;
      }

      return true;
    },
    {
      message: 'Check-out time requires check-in time',
      path: ['checkOutTime'],
    },
  );
