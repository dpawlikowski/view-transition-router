'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TransitionProvider } from 'view-transition-router';

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <TransitionProvider config={{ navigate: (to) => router.push(to) }}>
      {children}
    </TransitionProvider>
  );
}
