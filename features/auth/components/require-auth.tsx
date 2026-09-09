'use client';

import type { ReactNode } from 'react';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAppSession } from '@/shared/session';

import { useAuthStatus } from '../auth.hooks';

type RequireAuthProps = {
  children: ReactNode;
};

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const router = useRouter();
  const session = useAppSession();
  const { isBootstrapping, isAuthenticated, hasCompletedOnboarding } = useAuthStatus();

  useEffect(() => {
    if (session.isGuest) {
      return;
    }
    if (isBootstrapping) {
      return;
    }
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (!hasCompletedOnboarding) {
      router.replace('/onboarding');
    }
  }, [hasCompletedOnboarding, isAuthenticated, isBootstrapping, router, session.isGuest]);

  if (session.isGuest) {
    return children;
  }

  if (isBootstrapping || !isAuthenticated || !hasCompletedOnboarding) {
    return (
      <div className="bg-surface-gray flex min-h-dvh items-center justify-center text-sm text-[rgba(55,56,60,0.61)]">
        이동 중…
      </div>
    );
  }

  return children;
};
