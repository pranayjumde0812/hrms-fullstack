import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/shared/lib/api';
import { ThemeProvider } from '@/shared/theme/ThemeProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}
