import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { 
  Building2, Users, LayoutDashboard, Clock, DollarSign, 
  LogOut, Settings, Briefcase, Calendar
} from 'lucide-react';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
  };

  const menu = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['SUPER_ADMIN', 'HR_MANAGER', 'PROJECT_MANAGER', 'EMPLOYEE'] },
    { name: 'Employees', icon: Users, path: '/employees', roles: ['SUPER_ADMIN', 'HR_MANAGER'] },
    { name: 'Departments', icon: Building2, path: '/departments', roles: ['SUPER_ADMIN', 'HR_MANAGER'] },
    { name: 'Projects', icon: Briefcase, path: '/projects', roles: ['SUPER_ADMIN', 'HR_MANAGER', 'PROJECT_MANAGER', 'EMPLOYEE'] },
    { name: 'Timesheets', icon: Clock, path: '/timesheets', roles: ['SUPER_ADMIN', 'HR_MANAGER', 'PROJECT_MANAGER', 'EMPLOYEE'] },
    { name: 'Payroll', icon: DollarSign, path: '/payroll', roles: ['SUPER_ADMIN', 'HR_MANAGER', 'EMPLOYEE'] },
    { name: 'Leaves', icon: Calendar, path: '/leaves', roles: ['SUPER_ADMIN', 'HR_MANAGER', 'EMPLOYEE'] },
  ];

  const allowedMenu = menu.filter((item) => item.roles.includes(user.role));

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white dark:bg-zinc-900 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <Briefcase className="h-6 w-6" />
            CodersView
          </div>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Main Menu</p>
          <nav className="space-y-1">
            {allowedMenu.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-3 py-3 rounded-md bg-zinc-50 dark:bg-zinc-800 border mb-2">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex flex-shrink-0 items-center justify-center font-bold text-xs uppercase">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-semibold truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted-foreground truncate">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50 flex flex-shrink-0 items-center justify-between px-8">
          <h1 className="text-lg font-semibold text-foreground tracking-tight ">{/* dynamic title could go here */} Overview</h1>
          <div className="flex items-center gap-4">
             <button className="h-8 w-8 rounded-md border flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors">
               <Settings className="h-4 w-4" />
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
