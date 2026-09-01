'use client';

import type { ReactNode } from 'react';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAppSession } from '@/shared/session';

type RequireAuthProps = {
  children: ReactNode;
};

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const router = useRouter();
  const session = useAppSession();

  useEffect(() => {
    if (!session.isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (!session.hasCompletedOnboarding) {
      router.replace('/onboarding');
    }
  }, [router, session.hasCompletedOnboarding, session.isAuthenticated]);

  if (!session.isAuthenticated || !session.hasCompletedOnboarding) {
    return (
      <div className="bg-surface-gray flex min-h-dvh items-center justify-center text-sm text-[rgba(55,56,60,0.61)]">
        이동 중…
      </div>
    );
  }

  return children;
};
