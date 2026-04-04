import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import AppLayout from './components/layout/AppLayout';
import { DashboardView, EmployeesView, ProjectsView, TimesheetsView, PayrollView } from './pages/Views';
import { DepartmentsView } from './pages/DepartmentsView';
import { LeavesView } from './pages/LeavesView';

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<DashboardView />} />
        <Route path="employees" element={<ProtectedRoute roles={['SUPER_ADMIN', 'HR_MANAGER']}><EmployeesView /></ProtectedRoute>} />
        <Route path="departments" element={<ProtectedRoute roles={['SUPER_ADMIN', 'HR_MANAGER']}><DepartmentsView /></ProtectedRoute>} />
        <Route path="projects" element={<ProjectsView />} />
        <Route path="timesheets" element={<TimesheetsView />} />
        <Route path="payroll" element={<ProtectedRoute roles={['SUPER_ADMIN', 'HR_MANAGER', 'EMPLOYEE']}><PayrollView /></ProtectedRoute>} />
        <Route path="leaves" element={<LeavesView />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
