import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { 
  Building2, Users, LayoutDashboard, Clock, DollarSign, 
  LogOut, Briefcase, Calendar, Sun, Moon, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { data: attendanceOverview } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => api.get('/attendance/me').then((res: any) => res.data),
    enabled: !!user,
  });

  if (!user) return null;

  const todayAttendance = attendanceOverview?.today;
  const attendanceStatus = user.role === 'SUPER_ADMIN'
    ? 'Attendance Exempt'
    : todayAttendance
      ? todayAttendance.checkOutAt
        ? 'Checked Out'
        : `Checked In · ${todayAttendance.workMode === 'OFFICE' ? 'Office' : todayAttendance.workMode === 'WFH' ? 'WFH' : 'Other'}`
      : 'Not Checked In';

  const handleLogout = async () => {
    await logout();
  };

  const menu = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['SUPER_ADMIN', 'HR_MANAGER', 'PROJECT_MANAGER', 'EMPLOYEE'] },
    { name: 'Attendance', icon: Clock, path: '/attendance', roles: ['SUPER_ADMIN', 'HR_MANAGER', 'PROJECT_MANAGER', 'EMPLOYEE'] },
    { name: 'Employees', icon: Users, path: '/employees', roles: ['SUPER_ADMIN', 'HR_MANAGER'] },
    { name: 'Departments', icon: Building2, path: '/departments', roles: ['SUPER_ADMIN', 'HR_MANAGER'] },
    { name: 'Projects', icon: Briefcase, path: '/projects', roles: ['SUPER_ADMIN', 'HR_MANAGER', 'PROJECT_MANAGER', 'EMPLOYEE'] },
    { name: 'Timesheets', icon: Calendar, path: '/timesheets', roles: ['SUPER_ADMIN', 'HR_MANAGER', 'PROJECT_MANAGER', 'EMPLOYEE'] },
    { name: 'Payroll', icon: DollarSign, path: '/payroll', roles: ['SUPER_ADMIN', 'HR_MANAGER', 'EMPLOYEE'] },
    { name: 'Leaves', icon: Calendar, path: '/leaves', roles: ['SUPER_ADMIN', 'HR_MANAGER', 'EMPLOYEE'] },
  ];

  const allowedMenu = menu.filter((item) => item.roles.includes(user.role));

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <aside
        className={cn(
          'border-r bg-white dark:bg-zinc-900 flex flex-col overflow-x-hidden transition-[width] duration-300 ease-in-out',
          isSidebarCollapsed ? 'w-20' : 'w-64',
        )}
      >
        <div
          className={cn(
            'h-16 flex items-center border-b',
            isSidebarCollapsed ? 'justify-center px-3' : 'justify-between px-6',
          )}
        >
          <div className={cn('flex items-center text-primary', isSidebarCollapsed ? 'justify-center' : 'gap-2 font-bold text-xl')}>
            <Briefcase className="h-6 w-6" />
            {!isSidebarCollapsed && 'CodersView'}
          </div>
          {!isSidebarCollapsed && (
            <button
              onClick={() => setIsSidebarCollapsed(true)}
              className="h-9 w-9 rounded-md border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className={cn('flex-1 overflow-y-auto overflow-x-hidden', isSidebarCollapsed ? 'px-2 py-4' : 'p-4')}>
          <div className={cn('mb-3', isSidebarCollapsed ? 'flex justify-center' : 'px-2')}>
            {isSidebarCollapsed ? (
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="h-10 w-10 rounded-md border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            ) : (
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Main Menu</p>
            )}
          </div>
          <nav className="space-y-1">
            {allowedMenu.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center rounded-md text-sm font-medium transition-colors',
                    isSidebarCollapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5',
                    isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-foreground',
                  )
                }
                title={isSidebarCollapsed ? item.name : undefined}
              >
                <item.icon className="h-4 w-4" />
                {!isSidebarCollapsed && item.name}
                {isSidebarCollapsed && (
                  <span className="pointer-events-none absolute left-full top-1/2 z-20 ml-3 -translate-y-1/2 rounded-md bg-zinc-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 dark:bg-zinc-100 dark:text-zinc-900">
                    {item.name}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className={cn('border-t', isSidebarCollapsed ? 'p-2' : 'p-4')}>
          <div
            className={cn(
              'rounded-md bg-zinc-50 dark:bg-zinc-800 border mb-2',
              isSidebarCollapsed ? 'flex justify-center px-0 py-3' : 'flex items-center gap-3 px-3 py-3',
            )}
            title={isSidebarCollapsed ? `${user.firstName} ${user.lastName}` : undefined}
          >
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex flex-shrink-0 items-center justify-center font-bold text-xs uppercase">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-semibold truncate">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.role.replace('_', ' ')}</p>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className={cn(
              'group relative flex w-full rounded-md text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors',
              isSidebarCollapsed ? 'justify-center px-0 py-3' : 'items-center gap-3 px-3 py-2.5',
            )}
            title={isSidebarCollapsed ? 'Sign Out' : undefined}
          >
            <LogOut className="h-4 w-4" />
            {!isSidebarCollapsed && 'Sign Out'}
            {isSidebarCollapsed && (
              <span className="pointer-events-none absolute left-full top-1/2 z-20 ml-3 -translate-y-1/2 rounded-md bg-zinc-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 dark:bg-zinc-100 dark:text-zinc-900">
                Sign Out
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50 flex flex-shrink-0 items-center justify-between px-8">
          <h1 className="text-lg font-semibold text-foreground tracking-tight ">{/* dynamic title could go here */} Overview</h1>
          <div className="flex items-center gap-4">
             <NavLink
               to="/attendance"
               className="hidden items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 md:inline-flex"
             >
               <Clock className="h-4 w-4" />
               {attendanceStatus}
             </NavLink>
             <button
               onClick={toggleTheme}
               className="inline-flex items-center gap-2 rounded-md border px-3 py-2 hover:bg-muted text-muted-foreground transition-colors"
               aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
               title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
             >
               {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
               <span className="text-sm font-medium text-foreground">{theme === 'dark' ? 'Light' : 'Dark'}</span>
             </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
