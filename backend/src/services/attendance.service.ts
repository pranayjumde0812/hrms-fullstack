import { Role, WorkMode } from '@prisma/client';
import { attendanceRepository, usersRepository } from '../repositories';
import { AppError } from '../utils/http';

const getStartOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const ATTENDANCE_REVIEW_ROLES: Role[] = ['SUPER_ADMIN', 'HR_MANAGER', 'PROJECT_MANAGER'];

const ensureAttendanceRequired = (role: Role) => {
  if (role === 'SUPER_ADMIN') {
    throw new AppError(403, 'Super Admin does not need to check in or check out');
  }
};

const canReviewOtherUsersAttendance = (role: Role) => ATTENDANCE_REVIEW_ROLES.includes(role);

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

  return attendanceRepository.createAttendance({
    userId: input.userId,
    attendanceDate,
    workMode: input.workMode,
    checkInAt: new Date(),
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

  return attendanceRepository.updateAttendance(existingRecord.id, {
    checkOutAt: new Date(),
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
      workMode: record?.workMode ?? null,
      checkInAt: record?.checkInAt ?? null,
      checkOutAt: record?.checkOutAt ?? null,
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
      absentDays: days.filter((day) => day.status === 'ABSENT').length,
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
