import {
  AttendanceDayStatus,
  AttendanceRegularizationStatus,
  AttendanceRegularizationType,
  AttendanceOvertimeStatus,
  Role,
  WorkMode,
} from '@prisma/client';
import { attendanceRegularizationRepository, attendanceRepository, usersRepository } from '../repositories';
import { AppError } from '../utils/http';

const getStartOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const ATTENDANCE_REVIEW_ROLES: Role[] = ['SUPER_ADMIN', 'HR_MANAGER', 'PROJECT_MANAGER'];
const LATE_AFTER_HOUR = 10;
const LATE_AFTER_MINUTE = 15;
const HALF_DAY_AFTER_HOUR = 13;
const HALF_DAY_AFTER_MINUTE = 0;
const HALF_DAY_MIN_WORKING_HOURS = 4.5;
const STANDARD_WORKING_HOURS = 8;

const ensureAttendanceRequired = (role: Role) => {
  if (role === 'SUPER_ADMIN') {
    throw new AppError(403, 'Super Admin does not need to check in or check out');
  }
};

const canReviewOtherUsersAttendance = (role: Role) => ATTENDANCE_REVIEW_ROLES.includes(role);
const canElevatedReviewRegularization = (role: Role) => ['SUPER_ADMIN', 'HR_MANAGER'].includes(role);
const canManageManualAttendanceCorrection = (role: Role) => ['SUPER_ADMIN', 'HR_MANAGER'].includes(role);

const getAttendanceDateFromString = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const combineDateAndTime = (dateString: string, timeString: string) => new Date(`${dateString}T${timeString}:00`);

const getMinuteOfDay = (date: Date) => date.getHours() * 60 + date.getMinutes();

const computeAttendanceMetrics = (checkInAt: Date, checkOutAt?: Date | null) => {
  const lateThreshold = LATE_AFTER_HOUR * 60 + LATE_AFTER_MINUTE;
  const halfDayThreshold = HALF_DAY_AFTER_HOUR * 60 + HALF_DAY_AFTER_MINUTE;
  const checkInMinute = getMinuteOfDay(checkInAt);
  const lateMark = checkInMinute > lateThreshold;

  if (!checkOutAt) {
    return {
      lateMark,
      workingHours: null,
      dayStatus: (lateMark ? 'LATE' : 'PRESENT') as AttendanceDayStatus,
      overtimeMinutes: 0,
      overtimeStatus: null as AttendanceOvertimeStatus | null,
    };
  }

  const workedHours = Math.max(0, (checkOutAt.getTime() - checkInAt.getTime()) / (1000 * 60 * 60));
  const isHalfDay = workedHours < HALF_DAY_MIN_WORKING_HOURS || checkInMinute >= halfDayThreshold;
  const overtimeMinutes = Math.max(0, Math.round((workedHours - STANDARD_WORKING_HOURS) * 60));

  return {
    lateMark,
    workingHours: Number(workedHours.toFixed(2)),
    dayStatus: (isHalfDay ? 'HALF_DAY' : lateMark ? 'LATE' : 'PRESENT') as AttendanceDayStatus,
    overtimeMinutes,
    overtimeStatus: (overtimeMinutes > 0 ? 'PENDING' : null) as AttendanceOvertimeStatus | null,
  };
};

const getOvertimeUpdatePayload = (metrics: {
  overtimeMinutes: number;
  overtimeStatus: AttendanceOvertimeStatus | null;
}) => ({
  overtimeMinutes: metrics.overtimeMinutes,
  overtimeStatus: metrics.overtimeStatus,
  overtimeReviewerId: null,
  overtimeReviewNotes: null,
  overtimeReviewedAt: null,
});

const resolveMonthlyRange = (month?: number, year?: number) => {
  const now = new Date();
  const selectedYear = year ?? now.getFullYear();
  const selectedMonthIndex = (month ?? now.getMonth() + 1) - 1;
  const from = new Date(selectedYear, selectedMonthIndex, 1);
  const to = new Date(selectedYear, selectedMonthIndex + 1, 0);

  return {
    from,
    to,
    month: selectedMonthIndex + 1,
    year: selectedYear,
  };
};

export const getMyAttendance = async (user: { id: number; role: Role }) => {
  const attendanceDate = getStartOfToday();
  const [today, history] = await Promise.all([
    attendanceRepository.findAttendanceForDate(user.id, attendanceDate),
    attendanceRepository.listAttendanceForUser(user.id),
  ]);

  return {
    today,
    history,
    isAttendanceRequired: user.role !== 'SUPER_ADMIN',
    rules: {
      lateAfter: `${String(LATE_AFTER_HOUR).padStart(2, '0')}:${String(LATE_AFTER_MINUTE).padStart(2, '0')}`,
      halfDayAfter: `${String(HALF_DAY_AFTER_HOUR).padStart(2, '0')}:${String(HALF_DAY_AFTER_MINUTE).padStart(2, '0')}`,
      halfDayMinWorkingHours: HALF_DAY_MIN_WORKING_HOURS,
    },
  };
};

export const checkIn = async (input: {
  userId: number;
  role: Role;
  workMode: WorkMode;
  latitude?: number;
  longitude?: number;
  ipAddress?: string | null;
  userAgent?: string | null;
}) => {
  ensureAttendanceRequired(input.role);
  const attendanceDate = getStartOfToday();
  const existingRecord = await attendanceRepository.findAttendanceForDate(input.userId, attendanceDate);

  if (existingRecord) {
    throw new AppError(
      409,
      existingRecord.checkOutAt ? 'Attendance is already completed for today' : 'You are already checked in for today',
    );
  }

  const checkInAt = new Date();
  const metrics = computeAttendanceMetrics(checkInAt);

  return attendanceRepository.createAttendance({
    userId: input.userId,
    attendanceDate,
    workMode: input.workMode,
    dayStatus: metrics.dayStatus,
    lateMark: metrics.lateMark,
    workingHours: metrics.workingHours ?? undefined,
    overtimeMinutes: metrics.overtimeMinutes,
    overtimeStatus: metrics.overtimeStatus,
    checkInAt,
    checkInLatitude: input.latitude,
    checkInLongitude: input.longitude,
    checkInIpAddress: input.ipAddress,
    checkInUserAgent: input.userAgent,
  });
};

export const checkOut = async (input: {
  userId: number;
  role: Role;
  latitude?: number;
  longitude?: number;
  ipAddress?: string | null;
  userAgent?: string | null;
}) => {
  ensureAttendanceRequired(input.role);
  const attendanceDate = getStartOfToday();
  const existingRecord = await attendanceRepository.findAttendanceForDate(input.userId, attendanceDate);

  if (!existingRecord) {
    throw new AppError(404, 'No active attendance record found for today');
  }

  if (existingRecord.checkOutAt) {
    throw new AppError(409, 'You have already checked out for today');
  }

  const checkOutAt = new Date();
  const metrics = computeAttendanceMetrics(existingRecord.checkInAt, checkOutAt);

  return attendanceRepository.updateAttendance(existingRecord.id, {
    checkOutAt,
    dayStatus: metrics.dayStatus,
    lateMark: metrics.lateMark,
    workingHours: metrics.workingHours,
    overtimeMinutes: metrics.overtimeMinutes,
    overtimeStatus: metrics.overtimeStatus,
    overtimeReviewerId: null,
    overtimeReviewNotes: null,
    overtimeReviewedAt: null,
    checkOutLatitude: input.latitude,
    checkOutLongitude: input.longitude,
    checkOutIpAddress: input.ipAddress,
    checkOutUserAgent: input.userAgent,
  });
};

export const getMonthlyAttendance = async (input: {
  requester: { id: number; role: Role };
  month?: number;
  year?: number;
  userId?: number;
}) => {
  const targetUserId =
    input.userId && input.userId !== input.requester.id
      ? canReviewOtherUsersAttendance(input.requester.role)
        ? input.userId
        : (() => {
            throw new AppError(403, 'You can only view your own attendance');
          })()
      : input.requester.id;

  const { from, to, month, year } = resolveMonthlyRange(input.month, input.year);
  const records = await attendanceRepository.listAttendanceForUserInRange(targetUserId, from, to);
  const daysInMonth = to.getDate();

  const recordsByDay = new Map<number, (typeof records)[number]>();
  records.forEach((record) => {
    recordsByDay.set(new Date(record.attendanceDate).getDate(), record);
  });

  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const record = recordsByDay.get(day);

    return {
      day,
      date: new Date(year, month - 1, day).toISOString(),
      status: record ? 'PRESENT' : 'ABSENT',
      dayStatus: record?.dayStatus ?? null,
      lateMark: record?.lateMark ?? false,
      workingHours: record?.workingHours ?? null,
      workMode: record?.workMode ?? null,
      checkInAt: record?.checkInAt ?? null,
      checkOutAt: record?.checkOutAt ?? null,
      overtimeMinutes: record?.overtimeMinutes ?? 0,
      overtimeStatus: record?.overtimeStatus ?? null,
      remarks: record?.remarks ?? null,
      manualCorrectionReason: record?.manualCorrectionReason ?? null,
      manualCorrectedAt: record?.manualCorrectedAt ?? null,
    };
  });

  const user = await usersRepository.findUserByIdWithDepartment(targetUserId);

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return {
    month,
    year,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      department: user.department?.name ?? null,
    },
    summary: {
      presentDays: records.length,
      lateDays: records.filter((record) => record.dayStatus === 'LATE').length,
      halfDays: records.filter((record) => record.dayStatus === 'HALF_DAY').length,
      absentDays: days.filter((day) => day.status === 'ABSENT').length,
      overtimeDays: records.filter((record) => record.overtimeMinutes > 0).length,
      pendingOvertimeDays: records.filter((record) => record.overtimeStatus === 'PENDING').length,
    },
    days,
  };
};

export const listAttendanceViewableUsers = async (requester: { id: number; role: Role }) => {
  if (!canReviewOtherUsersAttendance(requester.role)) {
    const user = await usersRepository.findUserByIdWithDepartment(requester.id);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return [
      {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    ];
  }

  const users = await usersRepository.listUsers();
  return users.map((user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  }));
};

const validateRegularizationPayload = (input: {
  type: AttendanceRegularizationType;
  requestedCheckInTime?: string;
  requestedCheckOutTime?: string;
  requestedWorkMode?: WorkMode;
}) => {
  if (input.type === 'MISSED_CHECK_IN') {
    if (!input.requestedCheckInTime || !input.requestedWorkMode) {
      throw new AppError(400, 'Missed check-in requires corrected check-in time and work mode');
    }
  }

  if (input.type === 'MISSED_CHECK_OUT') {
    if (!input.requestedCheckOutTime) {
      throw new AppError(400, 'Missed check-out requires corrected check-out time');
    }
  }

  if (input.type === 'FULL_CORRECTION') {
    if (!input.requestedCheckInTime || !input.requestedCheckOutTime || !input.requestedWorkMode) {
      throw new AppError(400, 'Full correction requires check-in time, check-out time, and work mode');
    }
  }

  if (input.type === 'WORK_MODE_CORRECTION') {
    if (!input.requestedWorkMode) {
      throw new AppError(400, 'Work mode correction requires a work mode');
    }
  }
};

export const getRegularizations = async (requester: { id: number; role: Role }) => {
  const [myRequests, reviewRequests, overtimeRequests] = await Promise.all([
    attendanceRegularizationRepository.listRegularizationsForUser(requester.id),
    ATTENDANCE_REVIEW_ROLES.includes(requester.role)
      ? attendanceRegularizationRepository.listRegularizationsForReview(
          requester.id,
          canElevatedReviewRegularization(requester.role),
        )
      : Promise.resolve([]),
    ATTENDANCE_REVIEW_ROLES.includes(requester.role)
      ? attendanceRepository.listOvertimeForReview(
          requester.id,
          canElevatedReviewRegularization(requester.role),
        )
      : Promise.resolve([]),
  ]);

  return {
    myRequests,
    reviewRequests,
    overtimeRequests,
  };
};

export const createRegularization = async (input: {
  userId: number;
  role: Role;
  attendanceDate: string;
  type: AttendanceRegularizationType;
  reason: string;
  requestedCheckInTime?: string;
  requestedCheckOutTime?: string;
  requestedWorkMode?: WorkMode;
}) => {
  ensureAttendanceRequired(input.role);
  validateRegularizationPayload(input);

  const attendanceDate = getAttendanceDateFromString(input.attendanceDate);
  const pendingRequest = await attendanceRegularizationRepository.findPendingRegularizationForDate(
    input.userId,
    attendanceDate,
  );

  if (pendingRequest) {
    throw new AppError(409, 'A pending regularization request already exists for this date');
  }

  return attendanceRegularizationRepository.createRegularization({
    userId: input.userId,
    attendanceDate,
    type: input.type,
    reason: input.reason,
    requestedCheckInAt: input.requestedCheckInTime
      ? combineDateAndTime(input.attendanceDate, input.requestedCheckInTime)
      : undefined,
    requestedCheckOutAt: input.requestedCheckOutTime
      ? combineDateAndTime(input.attendanceDate, input.requestedCheckOutTime)
      : undefined,
    requestedWorkMode: input.requestedWorkMode,
  });
};

const applyRegularizationToAttendance = async (request: Awaited<ReturnType<typeof attendanceRegularizationRepository.findRegularizationById>>) => {
  if (!request) {
    throw new AppError(404, 'Regularization request not found');
  }

  const existingAttendance = await attendanceRepository.findAttendanceForDate(request.userId, request.attendanceDate);

  if (request.type === 'MISSED_CHECK_IN') {
    if (!request.requestedCheckInAt || !request.requestedWorkMode) {
      throw new AppError(400, 'Regularization request is missing corrected check-in details');
    }

    if (existingAttendance) {
      const metrics = computeAttendanceMetrics(request.requestedCheckInAt, existingAttendance.checkOutAt);
      return attendanceRepository.updateAttendance(existingAttendance.id, {
        checkInAt: request.requestedCheckInAt,
        workMode: request.requestedWorkMode,
        dayStatus: metrics.dayStatus,
        lateMark: metrics.lateMark,
        workingHours: metrics.workingHours,
        ...getOvertimeUpdatePayload(metrics),
      });
    }

    const metrics = computeAttendanceMetrics(request.requestedCheckInAt);
    return attendanceRepository.createAttendance({
      userId: request.userId,
      attendanceDate: request.attendanceDate,
      checkInAt: request.requestedCheckInAt,
      workMode: request.requestedWorkMode,
      dayStatus: metrics.dayStatus,
      lateMark: metrics.lateMark,
      workingHours: metrics.workingHours ?? undefined,
      overtimeMinutes: metrics.overtimeMinutes,
      overtimeStatus: metrics.overtimeStatus,
    });
  }

  if (request.type === 'MISSED_CHECK_OUT') {
    if (!existingAttendance) {
      throw new AppError(400, 'Cannot correct check-out because no attendance exists for that date');
    }

    if (!request.requestedCheckOutAt) {
      throw new AppError(400, 'Regularization request is missing corrected check-out details');
    }

    const metrics = computeAttendanceMetrics(existingAttendance.checkInAt, request.requestedCheckOutAt);

    return attendanceRepository.updateAttendance(existingAttendance.id, {
      checkOutAt: request.requestedCheckOutAt,
      dayStatus: metrics.dayStatus,
      lateMark: metrics.lateMark,
      workingHours: metrics.workingHours,
      ...getOvertimeUpdatePayload(metrics),
    });
  }

  if (request.type === 'FULL_CORRECTION') {
    if (!request.requestedCheckInAt || !request.requestedCheckOutAt || !request.requestedWorkMode) {
      throw new AppError(400, 'Regularization request is missing full correction details');
    }

    if (existingAttendance) {
      const metrics = computeAttendanceMetrics(request.requestedCheckInAt, request.requestedCheckOutAt);
      return attendanceRepository.updateAttendance(existingAttendance.id, {
        checkInAt: request.requestedCheckInAt,
        checkOutAt: request.requestedCheckOutAt,
        workMode: request.requestedWorkMode,
        dayStatus: metrics.dayStatus,
        lateMark: metrics.lateMark,
        workingHours: metrics.workingHours,
        ...getOvertimeUpdatePayload(metrics),
      });
    }

    const metrics = computeAttendanceMetrics(request.requestedCheckInAt, request.requestedCheckOutAt);
    return attendanceRepository.createAttendance({
      userId: request.userId,
      attendanceDate: request.attendanceDate,
      checkInAt: request.requestedCheckInAt,
      checkOutAt: request.requestedCheckOutAt,
      workMode: request.requestedWorkMode,
      dayStatus: metrics.dayStatus,
      lateMark: metrics.lateMark,
      workingHours: metrics.workingHours ?? undefined,
      overtimeMinutes: metrics.overtimeMinutes,
      overtimeStatus: metrics.overtimeStatus,
    });
  }

  if (!request.requestedWorkMode) {
    throw new AppError(400, 'Regularization request is missing corrected work mode');
  }

  if (!existingAttendance) {
    throw new AppError(400, 'Cannot correct work mode because no attendance exists for that date');
  }

  const metrics = computeAttendanceMetrics(existingAttendance.checkInAt, existingAttendance.checkOutAt);

  return attendanceRepository.updateAttendance(existingAttendance.id, {
    workMode: request.requestedWorkMode,
    dayStatus: metrics.dayStatus,
    lateMark: metrics.lateMark,
    workingHours: metrics.workingHours,
    ...getOvertimeUpdatePayload(metrics),
  });
};

export const reviewRegularization = async (input: {
  requestId: number;
  reviewer: { id: number; role: Role };
  status: AttendanceRegularizationStatus;
  reviewNotes?: string;
}) => {
  const request = await attendanceRegularizationRepository.findRegularizationById(input.requestId);

  if (!request) {
    throw new AppError(404, 'Regularization request not found');
  }

  if (request.status !== 'PENDING') {
    throw new AppError(409, 'This regularization request has already been reviewed');
  }

  const isElevatedReviewer = canElevatedReviewRegularization(input.reviewer.role);
  const isReportingManager = request.user.managerId === input.reviewer.id;

  if (!isElevatedReviewer && !isReportingManager) {
    throw new AppError(403, 'You are not allowed to review this regularization request');
  }

  if (input.status === 'APPROVED') {
    await applyRegularizationToAttendance(request);
  }

  return attendanceRegularizationRepository.updateRegularization(request.id, {
    status: input.status,
    reviewerId: input.reviewer.id,
    reviewNotes: input.reviewNotes,
    reviewedAt: new Date(),
  });
};

export const reviewOvertime = async (input: {
  attendanceId: number;
  reviewer: { id: number; role: Role };
  status: AttendanceOvertimeStatus;
  reviewNotes?: string;
}) => {
  const attendance = await attendanceRepository.findAttendanceById(input.attendanceId);

  if (!attendance) {
    throw new AppError(404, 'Attendance record not found');
  }

  if (attendance.overtimeMinutes <= 0) {
    throw new AppError(400, 'This attendance record does not have overtime to review');
  }

  const isElevatedReviewer = canElevatedReviewRegularization(input.reviewer.role);
  const isReportingManager = attendance.user.managerId === input.reviewer.id;

  if (!isElevatedReviewer && !isReportingManager) {
    throw new AppError(403, 'You are not allowed to review this overtime request');
  }

  if (attendance.overtimeStatus && attendance.overtimeStatus !== 'PENDING') {
    throw new AppError(409, 'This overtime request has already been reviewed');
  }

  return attendanceRepository.updateAttendance(attendance.id, {
    overtimeStatus: input.status,
    overtimeReviewerId: input.reviewer.id,
    overtimeReviewNotes: input.reviewNotes,
    overtimeReviewedAt: new Date(),
  });
};

export const applyManualAttendanceCorrection = async (input: {
  requester: { id: number; role: Role };
  userId: number;
  attendanceDate: string;
  workMode?: WorkMode;
  checkInTime?: string;
  checkOutTime?: string;
  remarks?: string;
  correctionReason: string;
}) => {
  if (!canManageManualAttendanceCorrection(input.requester.role)) {
    throw new AppError(403, 'You are not allowed to make manual attendance corrections');
  }

  const user = await usersRepository.findUserById(input.userId);

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  ensureAttendanceRequired(user.role);

  const attendanceDate = getAttendanceDateFromString(input.attendanceDate);
  const existingAttendance = await attendanceRepository.findAttendanceForDateWithRelations(input.userId, attendanceDate);

  if (!existingAttendance && (!input.checkInTime || !input.workMode)) {
    throw new AppError(400, 'New manual attendance entries require check-in time and work mode');
  }

  const resolvedCheckInAt = input.checkInTime
    ? combineDateAndTime(input.attendanceDate, input.checkInTime)
    : existingAttendance?.checkInAt;

  const resolvedCheckOutAt = input.checkOutTime
    ? combineDateAndTime(input.attendanceDate, input.checkOutTime)
    : existingAttendance?.checkOutAt ?? undefined;

  const resolvedWorkMode = input.workMode ?? existingAttendance?.workMode;

  if (!resolvedCheckInAt || !resolvedWorkMode) {
    throw new AppError(400, 'Manual correction requires a check-in time and work mode');
  }

  if (resolvedCheckOutAt && resolvedCheckOutAt <= resolvedCheckInAt) {
    throw new AppError(400, 'Check-out time must be later than check-in time');
  }

  const metrics = computeAttendanceMetrics(resolvedCheckInAt, resolvedCheckOutAt);
  const remarks = input.remarks?.trim() || null;

  if (existingAttendance) {
    return attendanceRepository.updateAttendance(existingAttendance.id, {
      checkInAt: resolvedCheckInAt,
      checkOutAt: resolvedCheckOutAt,
      workMode: resolvedWorkMode,
      remarks,
      dayStatus: metrics.dayStatus,
      lateMark: metrics.lateMark,
      workingHours: metrics.workingHours,
      manualCorrectionReason: input.correctionReason,
      manualCorrectedById: input.requester.id,
      manualCorrectedAt: new Date(),
      ...getOvertimeUpdatePayload(metrics),
    });
  }

  return attendanceRepository.createAttendance({
    userId: input.userId,
    attendanceDate,
    workMode: resolvedWorkMode,
    remarks,
    dayStatus: metrics.dayStatus,
    lateMark: metrics.lateMark,
    workingHours: metrics.workingHours ?? undefined,
    overtimeMinutes: metrics.overtimeMinutes,
    overtimeStatus: metrics.overtimeStatus,
    manualCorrectionReason: input.correctionReason,
    manualCorrectedById: input.requester.id,
    manualCorrectedAt: new Date(),
    checkInAt: resolvedCheckInAt,
    checkOutAt: resolvedCheckOutAt,
  });
};
