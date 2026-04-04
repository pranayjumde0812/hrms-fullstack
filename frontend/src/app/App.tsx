import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/shared/auth/useAuth';
import { AppRouter } from '@/app/router/AppRouter';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}
