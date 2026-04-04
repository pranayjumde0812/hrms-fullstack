import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Label, Select } from '@/components/ui/components';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { getSilentLocation } from '@/shared/location/getSilentLocation';
import { Building2, CalendarDays, ChevronRight, Clock3, LogIn, LogOut, TimerReset, X } from 'lucide-react';

type WorkMode = 'WFH' | 'OFFICE' | 'OTHER';

type AttendanceRecord = {
  id: number;
  workMode: WorkMode;
  checkInAt: string;
  checkOutAt?: string | null;
};

type AttendanceOverview = {
  today: AttendanceRecord | null;
  history: AttendanceRecord[];
  isAttendanceRequired: boolean;
};

type AttendanceUser = {
  id: number;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'HR_MANAGER' | 'PROJECT_MANAGER' | 'EMPLOYEE';
};

type MonthlyAttendance = {
  month: number;
  year: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    role: AttendanceUser['role'];
    department: string | null;
  };
  summary: {
    presentDays: number;
    absentDays: number;
  };
  days: Array<{
    day: number;
    date: string;
    status: 'PRESENT' | 'ABSENT';
    workMode: WorkMode | null;
    checkInAt: string | null;
    checkOutAt: string | null;
  }>;
};

const workModeLabels: Record<WorkMode, string> = {
  WFH: 'WFH',
  OFFICE: 'Office',
  OTHER: 'Other',
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return 'Pending';
  }

  return new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const formatTime = (value?: string | null) => {
  if (!value) {
    return '--';
  }

  return new Date(value).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatDuration = (start: string, end?: string | null) => {
  if (!end) {
    return 'In progress';
  }

  const durationMs = new Date(end).getTime() - new Date(start).getTime();
  const totalMinutes = Math.max(0, Math.floor(durationMs / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
};

export function AttendancePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedMode, setSelectedMode] = useState<WorkMode>('OFFICE');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedMonthNumber, setSelectedMonthNumber] = useState(() => new Date().getMonth() + 1);
  const [selectedYearNumber, setSelectedYearNumber] = useState(() => new Date().getFullYear());
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const canReviewOtherAttendance = user ? ['SUPER_ADMIN', 'HR_MANAGER', 'PROJECT_MANAGER'].includes(user.role) : false;

  const { data, isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => api.get('/attendance/me').then((res: any) => res.data as AttendanceOverview),
    enabled: !!user,
  });

  const todayAttendance = data?.today ?? undefined;
  const attendanceHistory = useMemo(() => data?.history ?? [], [data]);
  const isAttendanceRequired = data?.isAttendanceRequired ?? true;

  const { data: attendanceUsers = [] } = useQuery({
    queryKey: ['attendance-viewable-users'],
    queryFn: () => api.get('/attendance/viewable-users').then((res: any) => res.data as AttendanceUser[]),
    enabled: !!user,
  });

  const targetUserId = selectedUserId ?? user?.id ?? 0;
  const selectedMonthDate = new Date(selectedYearNumber, selectedMonthNumber - 1, 1);
  const monthQueryKey = `${selectedYearNumber}-${String(selectedMonthNumber).padStart(2, '0')}`;

  const monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const yearOptions = Array.from({ length: 7 }, (_, index) => {
    const year = new Date().getFullYear() - 3 + index;
    return year;
  });

  const { data: monthlyAttendance, isLoading: isMonthlyAttendanceLoading } = useQuery({
    queryKey: ['attendance-monthly', targetUserId, monthQueryKey],
    queryFn: () =>
      api
        .get('/attendance/monthly', {
          params: {
            userId: targetUserId,
            month: selectedMonthNumber,
            year: selectedYearNumber,
          },
        })
        .then((res: any) => res.data as MonthlyAttendance),
    enabled: !!user && !!targetUserId && isDrawerOpen,
  });

  const refreshAttendance = async () => {
    await queryClient.invalidateQueries({ queryKey: ['attendance'] });
  };

  const checkInMutation = useMutation({
    mutationFn: async (workMode: WorkMode) => {
      const location = await getSilentLocation();
      return api.post('/attendance/check-in', {
        workMode,
        ...(location ?? {}),
      });
    },
    onSuccess: async () => {
      await refreshAttendance();
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async () => {
      const location = await getSilentLocation();
      return api.post('/attendance/check-out', location ?? {});
    },
    onSuccess: async () => {
      await refreshAttendance();
    },
  });

  useEffect(() => {
    if (user && selectedUserId == null && attendanceUsers.length > 0) {
      setSelectedUserId(canReviewOtherAttendance ? user.id : attendanceUsers[0].id);
    }
  }, [attendanceUsers, canReviewOtherAttendance, selectedUserId, user]);

  if (!user) {
    return null;
  }

  const isCheckedIn = !!todayAttendance && !todayAttendance.checkOutAt;
  const canCheckIn = isAttendanceRequired && !todayAttendance;
  const canCheckOut = isAttendanceRequired && !!todayAttendance && !todayAttendance.checkOutAt;
  const monthLabel = selectedMonthDate.toLocaleDateString([], { month: 'long', year: 'numeric' });

  const handleCheckIn = async () => {
    try {
      await checkInMutation.mutateAsync(selectedMode);
      setFeedback({ type: 'success', message: `Checked in successfully for ${workModeLabels[selectedMode]}.` });
    } catch (error) {
      const message = (error as any)?.response?.data?.message || 'Unable to check in right now.';
      setFeedback({ type: 'error', message });
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOutMutation.mutateAsync();
      setFeedback({ type: 'success', message: 'Checked out successfully for today.' });
    } catch (error) {
      const message = (error as any)?.response?.data?.message || 'Unable to check out right now.';
      setFeedback({ type: 'error', message });
    }
  };

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center text-muted-foreground">Loading attendance...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
        <p className="text-muted-foreground">Check in, check out, and keep track of where you are working each day.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={() => setIsDrawerOpen(true)} className="gap-2">
          <CalendarDays className="h-4 w-4" />
          View Monthly Attendance
          <ChevronRight className="h-4 w-4" />
        </Button>
        {!isAttendanceRequired && (
          <Badge variant="warning">Super Admin is exempt from daily check-in</Badge>
        )}
      </div>

      {feedback && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-2xl">Today&apos;s attendance</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  {new Date().toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <Badge variant={isCheckedIn ? 'success' : todayAttendance?.checkOutAt ? 'default' : 'warning'}>
                {isCheckedIn ? 'Checked In' : todayAttendance?.checkOutAt ? 'Checked Out' : 'Not Checked In'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border bg-background/70 p-4">
                <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Work Mode</span>
                </div>
                <p className="text-2xl font-semibold">
                  {!isAttendanceRequired ? 'Exempt' : todayAttendance ? workModeLabels[todayAttendance.workMode] : 'Not selected'}
                </p>
              </div>
              <div className="rounded-xl border bg-background/70 p-4">
                <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                  <LogIn className="h-4 w-4" />
                  <span className="text-sm font-medium">Check In</span>
                </div>
                <p className="text-2xl font-semibold">{formatTime(todayAttendance?.checkInAt)}</p>
              </div>
              <div className="rounded-xl border bg-background/70 p-4">
                <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">Check Out</span>
                </div>
                <p className="text-2xl font-semibold">{formatTime(todayAttendance?.checkOutAt)}</p>
              </div>
            </div>

            <div className="grid gap-4 rounded-xl border border-dashed p-4 md:grid-cols-[1fr,auto,auto] md:items-end">
              <div className="space-y-2">
                <Label htmlFor="work-mode">Select work mode</Label>
                <Select
                  id="work-mode"
                  value={todayAttendance?.workMode ?? selectedMode}
                  onChange={(event) => setSelectedMode(event.target.value as WorkMode)}
                  disabled={!canCheckIn || checkInMutation.isPending}
                >
                  <option value="WFH">WFH</option>
                  <option value="OFFICE">Office</option>
                  <option value="OTHER">Other</option>
                </Select>
              </div>
              <Button onClick={handleCheckIn} disabled={!canCheckIn || checkInMutation.isPending || checkOutMutation.isPending} className="gap-2">
                <LogIn className="h-4 w-4" />
                {checkInMutation.isPending ? 'Checking In...' : 'Check In'}
              </Button>
              <Button onClick={handleCheckOut} disabled={!canCheckOut || checkInMutation.isPending || checkOutMutation.isPending} variant="outline" className="gap-2">
                <LogOut className="h-4 w-4" />
                {checkOutMutation.isPending ? 'Checking Out...' : 'Check Out'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">Current summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border p-4">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                <Clock3 className="h-4 w-4" />
                <span className="text-sm font-medium">Live status</span>
              </div>
              <p className="text-lg font-semibold">
                {isCheckedIn
                  ? `Working from ${workModeLabels[todayAttendance!.workMode]}`
                  : !isAttendanceRequired
                    ? 'Super Admin does not need attendance marking'
                  : todayAttendance?.checkOutAt
                    ? 'Attendance completed for today'
                    : 'You have not checked in yet'}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {todayAttendance
                  ? `Started at ${formatDateTime(todayAttendance.checkInAt)}`
                  : !isAttendanceRequired
                    ? 'You can still review monthly attendance records from the panel.'
                  : 'Use the selector to mark whether you are in WFH, Office, or Other mode.'}
              </p>
            </div>

            <div className="rounded-xl border p-4">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                <TimerReset className="h-4 w-4" />
                <span className="text-sm font-medium">Duration</span>
              </div>
              <p className="text-lg font-semibold">
                {todayAttendance ? formatDuration(todayAttendance.checkInAt, todayAttendance.checkOutAt) : '--'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Recent attendance history</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Mode</th>
                  <th className="px-4 py-3 font-medium">Check In</th>
                  <th className="px-4 py-3 font-medium">Check Out</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {attendanceHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                      No attendance has been recorded yet.
                    </td>
                  </tr>
                ) : (
                  attendanceHistory.map((record) => (
                    <tr key={record.id} className="hover:bg-muted/40">
                      <td className="px-4 py-4">{new Date(record.checkInAt).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="px-4 py-4">{workModeLabels[record.workMode]}</td>
                      <td className="px-4 py-4">{formatDateTime(record.checkInAt)}</td>
                      <td className="px-4 py-4">{formatDateTime(record.checkOutAt)}</td>
                      <td className="px-4 py-4">{formatDuration(record.checkInAt, record.checkOutAt)}</td>
                      <td className="px-4 py-4">
                        <Badge variant={record.checkOutAt ? 'default' : 'success'}>
                          {record.checkOutAt ? 'Closed' : 'Active'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div
        className={`fixed inset-0 z-50 transition ${isDrawerOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!isDrawerOpen}
      >
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsDrawerOpen(false)}
        />
        <aside
          className={`absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto border-l bg-white shadow-2xl transition-transform duration-300 dark:bg-zinc-950 dark:border-zinc-800 ${
            isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="sticky top-0 z-10 border-b bg-white/95 px-6 py-4 backdrop-blur dark:bg-zinc-950/95 dark:border-zinc-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">Monthly attendance</h3>
                <p className="mt-1 text-sm text-muted-foreground">Month-wise attendance blocks with present days highlighted in green.</p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted"
                aria-label="Close monthly attendance panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-6 px-6 py-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="attendance-month">Month</Label>
                <Select
                  id="attendance-month"
                  value={String(selectedMonthNumber)}
                  onChange={(event) => setSelectedMonthNumber(Number(event.target.value))}
                >
                  {monthOptions.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendance-year">Year</Label>
                <Select
                  id="attendance-year"
                  value={String(selectedYearNumber)}
                  onChange={(event) => setSelectedYearNumber(Number(event.target.value))}
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendance-user">User</Label>
                <Select
                  id="attendance-user"
                  value={String(targetUserId)}
                  onChange={(event) => setSelectedUserId(Number(event.target.value))}
                  disabled={!canReviewOtherAttendance}
                >
                  {attendanceUsers.map((attendanceUser) => (
                    <option key={attendanceUser.id} value={attendanceUser.id}>
                      {attendanceUser.firstName} {attendanceUser.lastName} ({attendanceUser.role.replace('_', ' ')})
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {isMonthlyAttendanceLoading ? (
              <div className="flex h-48 items-center justify-center text-muted-foreground">Loading monthly attendance...</div>
            ) : monthlyAttendance ? (
              <>
                <div className="rounded-2xl border bg-zinc-50 p-5 dark:bg-zinc-900/60 dark:border-zinc-800">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-semibold">
                        {monthlyAttendance.user.firstName} {monthlyAttendance.user.lastName}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {monthlyAttendance.user.role.replace('_', ' ')}
                        {monthlyAttendance.user.department ? ` · ${monthlyAttendance.user.department}` : ''}
                      </p>
                    </div>
                    <Badge variant="success">{monthLabel}</Badge>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border bg-white p-4 dark:bg-zinc-950 dark:border-zinc-800">
                      <p className="text-sm text-muted-foreground">Present Days</p>
                      <p className="mt-1 text-2xl font-semibold text-emerald-600">{monthlyAttendance.summary.presentDays}</p>
                    </div>
                    <div className="rounded-xl border bg-white p-4 dark:bg-zinc-950 dark:border-zinc-800">
                      <p className="text-sm text-muted-foreground">Absent Days</p>
                      <p className="mt-1 text-2xl font-semibold">{monthlyAttendance.summary.absentDays}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm bg-emerald-500" />
                    Present
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm bg-zinc-200 dark:bg-zinc-800" />
                    Absent
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-3">
                  {monthlyAttendance.days.map((day) => (
                    <div
                      key={day.day}
                      className={`rounded-2xl border p-3 text-center transition-colors ${
                        day.status === 'PRESENT'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300'
                          : 'border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'
                      }`}
                      title={
                        day.status === 'PRESENT'
                          ? `${formatDateTime(day.checkInAt)} • ${day.workMode ? workModeLabels[day.workMode] : ''}`
                          : 'Absent'
                      }
                    >
                      <div className="text-xs font-medium">{day.day}</div>
                      <div className="mt-2 text-[10px] uppercase tracking-wider">
                        {day.status === 'PRESENT' ? 'P' : 'A'}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No monthly attendance data available.</div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
