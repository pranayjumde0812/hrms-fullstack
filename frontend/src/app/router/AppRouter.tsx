import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '@/app/layouts/AppLayout';
import { ProtectedRoute } from '@/app/router/ProtectedRoute';
import LoginPage from '@/modules/auth/pages/LoginPage';
import { DashboardPage } from '@/modules/dashboard/pages/DashboardPage';
import { DepartmentsPage } from '@/modules/departments/pages/DepartmentsPage';
import { EmployeesPage } from '@/modules/employees/pages/EmployeesPage';
import { LeavesPage } from '@/modules/leaves/pages/LeavesPage';
import { PayrollPage } from '@/modules/payroll/pages/PayrollPage';
import { ProjectsPage } from '@/modules/projects/pages/ProjectsPage';
import { TimesheetsPage } from '@/modules/timesheets/pages/TimesheetsPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route
          path="employees"
          element={
            <ProtectedRoute roles={['SUPER_ADMIN', 'HR_MANAGER']}>
              <EmployeesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="departments"
          element={
            <ProtectedRoute roles={['SUPER_ADMIN', 'HR_MANAGER']}>
              <DepartmentsPage />
            </ProtectedRoute>
          }
        />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="timesheets" element={<TimesheetsPage />} />
        <Route
          path="payroll"
          element={
            <ProtectedRoute roles={['SUPER_ADMIN', 'HR_MANAGER', 'EMPLOYEE']}>
              <PayrollPage />
            </ProtectedRoute>
          }
        />
        <Route path="leaves" element={<LeavesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
