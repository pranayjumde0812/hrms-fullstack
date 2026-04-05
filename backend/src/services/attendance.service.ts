import {
  AttendanceDayStatus,
  AttendanceRegularizationStatus,
  AttendanceRegularizationType,
  AttendanceOvertimeStatus,
  AttendanceSource,
  Role,
  WorkMode,
} from '@prisma/client';
import {
  attendancePoliciesRepository,
  attendanceRegularizationRepository,
  attendanceRepository,
  holidaysRepository,
  usersRepository,
  weeklyOffRulesRepository,
} from '../repositories';
import { AppError } from '../utils/http';

const getStartOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const ATTENDANCE_REVIEW_ROLES: Role[] = ['SUPER_ADMIN', 'HR_MANAGER', 'PROJECT_MANAGER'];
const DEFAULT_WEEKLY_OFF_DAYS = [0, 6];

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

const getFallbackAttendancePolicy = () => ({
  id: null,
  lateAfterMinutes: 10 * 60 + 15,
  halfDayAfterMinutes: 13 * 60,
  halfDayMinWorkingHours: 4.5,
  standardWorkingHours: 8,
});

const getApplicableAttendancePolicy = async (date: Date, workLocationId?: number | null) => {
  const policy = await attendancePoliciesRepository.findActiveAttendancePolicyForDate(date, workLocationId);
  return policy ?? getFallbackAttendancePolicy();
};

const computeAttendanceMetrics = (
  checkInAt: Date,
  policy: {
    lateAfterMinutes: number;
    halfDayAfterMinutes: number;
    halfDayMinWorkingHours: number;
    standardWorkingHours: number;
  },
  checkOutAt?: Date | null,
) => {
  const checkInMinute = getMinuteOfDay(checkInAt);
  const lateMark = checkInMinute > policy.lateAfterMinutes;

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
  const isHalfDay = workedHours < policy.halfDayMinWorkingHours || checkInMinute >= policy.halfDayAfterMinutes;
  const overtimeMinutes = Math.max(0, Math.round((workedHours - policy.standardWorkingHours) * 60));

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

const isWeeklyOffDate = async (date: Date, workLocationId?: number | null) => {
  const rules = await weeklyOffRulesRepository.listActiveWeeklyOffRulesForDate(date, workLocationId);
  if (rules.length === 0) {
    return DEFAULT_WEEKLY_OFF_DAYS.includes(date.getDay());
  }

  const weekNumberInMonth = Math.floor((date.getDate() - 1) / 7) + 1;
  return rules.some((rule) => rule.weekDay === date.getDay() && (rule.weekNumberInMonth == null || rule.weekNumberInMonth === weekNumberInMonth));
};

const getRuleTimeLabel = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

const getUserOrThrow = async (userId: number) => {
  const user = await usersRepository.findUserByIdWithDepartment(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return user;
};

export const getMyAttendance = async (user: { id: number; role: Role }) => {
  const attendanceDate = getStartOfToday();
  const userRecord = await getUserOrThrow(user.id);
  const policy = await getApplicableAttendancePolicy(attendanceDate, userRecord.workLocationId);

  const [today, history, todayHoliday, isWeeklyOff] = await Promise.all([
    attendanceRepository.findAttendanceForDate(user.id, attendanceDate),
    attendanceRepository.listAttendanceForUser(user.id),
    holidaysRepository.findHolidayByDate(attendanceDate, userRecord.workLocationId),
    isWeeklyOffDate(attendanceDate, userRecord.workLocationId),
  ]);

  return {
    today,
    history,
    isAttendanceRequired: user.role !== 'SUPER_ADMIN',
    todayClassification: today ? 'PRESENT' : todayHoliday ? 'HOLIDAY' : isWeeklyOff ? 'WEEKLY_OFF' : 'WORKING_DAY',
    todayHoliday,
    rules: {
      lateAfter: getRuleTimeLabel(policy.lateAfterMinutes),
      halfDayAfter: getRuleTimeLabel(policy.halfDayAfterMinutes),
      halfDayMinWorkingHours: policy.halfDayMinWorkingHours,
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
  const user = await getUserOrThrow(input.userId);
  const existingRecord = await attendanceRepository.findAttendanceForDate(input.userId, attendanceDate);

  if (existingRecord) {
    throw new AppError(
      409,
      existingRecord.checkOutAt ? 'Attendance is already completed for today' : 'You are already checked in for today',
    );
  }

  const checkInAt = new Date();
  const policy = await getApplicableAttendancePolicy(attendanceDate, user.workLocationId);
  const metrics = computeAttendanceMetrics(checkInAt, policy);

  return attendanceRepository.createAttendance({
    userId: input.userId,
    attendanceDate,
    workMode: input.workMode,
    source: 'WEB',
    policyId: policy.id ?? undefined,
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

  const policy = existingRecord.policy ?? (await getApplicableAttendancePolicy(attendanceDate));
  const checkOutAt = new Date();
  const metrics = computeAttendanceMetrics(existingRecord.checkInAt, policy, checkOutAt);

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

  const user = await getUserOrThrow(targetUserId);
  const { from, to, month, year } = resolveMonthlyRange(input.month, input.year);
  const [records, holidays] = await Promise.all([
    attendanceRepository.listAttendanceForUserInRange(targetUserId, from, to),
    holidaysRepository.listHolidays(from, to),
  ]);
  const daysInMonth = to.getDate();
  const recordsByDay = new Map<number, (typeof records)[number]>();
  records.forEach((record) => recordsByDay.set(new Date(record.attendanceDate).getDate(), record));
  const holidaysByDay = new Map<number, (typeof holidays)[number]>();
  holidays.forEach((holiday) => holidaysByDay.set(new Date(holiday.holidayDate).getDate(), holiday));

  const days = await Promise.all(
    Array.from({ length: daysInMonth }, async (_, index) => {
      const day = index + 1;
      const record = recordsByDay.get(day);
      const holiday = holidaysByDay.get(day);
      const currentDate = new Date(year, month - 1, day);
      const weeklyOff = await isWeeklyOffDate(currentDate, user.workLocationId);
      const status = record ? 'PRESENT' : holiday ? 'HOLIDAY' : weeklyOff ? 'WEEKLY_OFF' : 'ABSENT';

      return {
        day,
        date: currentDate.toISOString(),
        status,
        dayStatus: record?.dayStatus ?? null,
        lateMark: record?.lateMark ?? false,
        workingHours: record?.workingHours ?? null,
        workMode: record?.workMode ?? null,
        source: record?.source ?? null,
        checkInAt: record?.checkInAt ?? null,
        checkOutAt: record?.checkOutAt ?? null,
        overtimeMinutes: record?.overtimeMinutes ?? 0,
        overtimeStatus: record?.overtimeStatus ?? null,
        remarks: record?.remarks ?? null,
        manualCorrectionReason: record?.manualCorrectionReason ?? null,
        manualCorrectedAt: record?.manualCorrectedAt ?? null,
        holidayName: holiday?.name ?? null,
      };
    }),
  );

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
      holidayDays: days.filter((day) => day.status === 'HOLIDAY').length,
      weeklyOffDays: days.filter((day) => day.status === 'WEEKLY_OFF').length,
      overtimeDays: records.filter((record) => record.overtimeMinutes > 0).length,
      pendingOvertimeDays: records.filter((record) => record.overtimeStatus === 'PENDING').length,
    },
    days,
  };
};

export const listAttendanceViewableUsers = async (requester: { id: number; role: Role }) => {
  if (!canReviewOtherUsersAttendance(requester.role)) {
    const user = await getUserOrThrow(requester.id);
    return [{ id: user.id, firstName: user.firstName, lastName: user.lastName, role: user.role }];
  }

  const users = await usersRepository.listUsers();
  return users.map((user) => ({ id: user.id, firstName: user.firstName, lastName: user.lastName, role: user.role }));
};

const validateRegularizationPayload = (input: {
  type: AttendanceRegularizationType;
  requestedCheckInTime?: string;
  requestedCheckOutTime?: string;
  requestedWorkMode?: WorkMode;
}) => {
  if (input.type === 'MISSED_CHECK_IN' && (!input.requestedCheckInTime || !input.requestedWorkMode)) {
    throw new AppError(400, 'Missed check-in requires corrected check-in time and work mode');
  }
  if (input.type === 'MISSED_CHECK_OUT' && !input.requestedCheckOutTime) {
    throw new AppError(400, 'Missed check-out requires corrected check-out time');
  }
  if (input.type === 'FULL_CORRECTION' && (!input.requestedCheckInTime || !input.requestedCheckOutTime || !input.requestedWorkMode)) {
    throw new AppError(400, 'Full correction requires check-in time, check-out time, and work mode');
  }
  if (input.type === 'WORK_MODE_CORRECTION' && !input.requestedWorkMode) {
    throw new AppError(400, 'Work mode correction requires a work mode');
  }
};

export const getRegularizations = async (requester: { id: number; role: Role }) => {
  const [myRequests, reviewRequests, overtimeRequests] = await Promise.all([
    attendanceRegularizationRepository.listRegularizationsForUser(requester.id),
    ATTENDANCE_REVIEW_ROLES.includes(requester.role)
      ? attendanceRegularizationRepository.listRegularizationsForReview(requester.id, canElevatedReviewRegularization(requester.role))
      : Promise.resolve([]),
    ATTENDANCE_REVIEW_ROLES.includes(requester.role)
      ? attendanceRepository.listOvertimeForReview(requester.id, canElevatedReviewRegularization(requester.role))
      : Promise.resolve([]),
  ]);

  return { myRequests, reviewRequests, overtimeRequests };
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
  const pendingRequest = await attendanceRegularizationRepository.findPendingRegularizationForDate(input.userId, attendanceDate);
  if (pendingRequest) {
    throw new AppError(409, 'A pending regularization request already exists for this date');
  }

  return attendanceRegularizationRepository.createRegularization({
    userId: input.userId,
    attendanceDate,
    type: input.type,
    reason: input.reason,
    requestedCheckInAt: input.requestedCheckInTime ? combineDateAndTime(input.attendanceDate, input.requestedCheckInTime) : undefined,
    requestedCheckOutAt: input.requestedCheckOutTime ? combineDateAndTime(input.attendanceDate, input.requestedCheckOutTime) : undefined,
    requestedWorkMode: input.requestedWorkMode,
  });
};

const applyRegularizationToAttendance = async (request: Awaited<ReturnType<typeof attendanceRegularizationRepository.findRegularizationById>>) => {
  if (!request) {
    throw new AppError(404, 'Regularization request not found');
  }

  const user = await getUserOrThrow(request.userId);
  const policy = await getApplicableAttendancePolicy(request.attendanceDate, user.workLocationId);
  const existingAttendance = await attendanceRepository.findAttendanceForDate(request.userId, request.attendanceDate);

  if (request.type === 'MISSED_CHECK_IN') {
    const metrics = computeAttendanceMetrics(request.requestedCheckInAt!, policy, existingAttendance?.checkOutAt);
    if (existingAttendance) {
      return attendanceRepository.updateAttendance(existingAttendance.id, {
        checkInAt: request.requestedCheckInAt!,
        workMode: request.requestedWorkMode!,
        source: 'REGULARIZATION',
        policyId: policy.id ?? undefined,
        dayStatus: metrics.dayStatus,
        lateMark: metrics.lateMark,
        workingHours: metrics.workingHours,
        ...getOvertimeUpdatePayload(metrics),
      });
    }

    return attendanceRepository.createAttendance({
      userId: request.userId,
      attendanceDate: request.attendanceDate,
      checkInAt: request.requestedCheckInAt!,
      workMode: request.requestedWorkMode!,
      source: 'REGULARIZATION',
      policyId: policy.id ?? undefined,
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
    const metrics = computeAttendanceMetrics(existingAttendance.checkInAt, policy, request.requestedCheckOutAt!);
    return attendanceRepository.updateAttendance(existingAttendance.id, {
      checkOutAt: request.requestedCheckOutAt!,
      source: 'REGULARIZATION',
      policyId: policy.id ?? undefined,
      dayStatus: metrics.dayStatus,
      lateMark: metrics.lateMark,
      workingHours: metrics.workingHours,
      ...getOvertimeUpdatePayload(metrics),
    });
  }

  if (request.type === 'FULL_CORRECTION') {
    const metrics = computeAttendanceMetrics(request.requestedCheckInAt!, policy, request.requestedCheckOutAt!);
    if (existingAttendance) {
      return attendanceRepository.updateAttendance(existingAttendance.id, {
        checkInAt: request.requestedCheckInAt!,
        checkOutAt: request.requestedCheckOutAt!,
        workMode: request.requestedWorkMode!,
        source: 'REGULARIZATION',
        policyId: policy.id ?? undefined,
        dayStatus: metrics.dayStatus,
        lateMark: metrics.lateMark,
        workingHours: metrics.workingHours,
        ...getOvertimeUpdatePayload(metrics),
      });
    }

    return attendanceRepository.createAttendance({
      userId: request.userId,
      attendanceDate: request.attendanceDate,
      checkInAt: request.requestedCheckInAt!,
      checkOutAt: request.requestedCheckOutAt!,
      workMode: request.requestedWorkMode!,
      source: 'REGULARIZATION',
      policyId: policy.id ?? undefined,
      dayStatus: metrics.dayStatus,
      lateMark: metrics.lateMark,
      workingHours: metrics.workingHours ?? undefined,
      overtimeMinutes: metrics.overtimeMinutes,
      overtimeStatus: metrics.overtimeStatus,
    });
  }

  if (!existingAttendance) {
    throw new AppError(400, 'Cannot correct work mode because no attendance exists for that date');
  }
  const metrics = computeAttendanceMetrics(existingAttendance.checkInAt, policy, existingAttendance.checkOutAt);
  return attendanceRepository.updateAttendance(existingAttendance.id, {
    workMode: request.requestedWorkMode!,
    source: 'REGULARIZATION',
    policyId: policy.id ?? undefined,
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

  const user = await getUserOrThrow(input.userId);
  ensureAttendanceRequired(user.role);

  const attendanceDate = getAttendanceDateFromString(input.attendanceDate);
  const existingAttendance = await attendanceRepository.findAttendanceForDateWithRelations(input.userId, attendanceDate);
  if (!existingAttendance && (!input.checkInTime || !input.workMode)) {
    throw new AppError(400, 'New manual attendance entries require check-in time and work mode');
  }

  const resolvedCheckInAt = input.checkInTime ? combineDateAndTime(input.attendanceDate, input.checkInTime) : existingAttendance?.checkInAt;
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

  const policy = await getApplicableAttendancePolicy(attendanceDate, user.workLocationId);
  const metrics = computeAttendanceMetrics(resolvedCheckInAt, policy, resolvedCheckOutAt);
  const remarks = input.remarks?.trim() || null;

  if (existingAttendance) {
    return attendanceRepository.updateAttendance(existingAttendance.id, {
      checkInAt: resolvedCheckInAt,
      checkOutAt: resolvedCheckOutAt,
      workMode: resolvedWorkMode,
      source: 'MANUAL_CORRECTION',
      policyId: policy.id ?? undefined,
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
    source: 'MANUAL_CORRECTION',
    policyId: policy.id ?? undefined,
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
