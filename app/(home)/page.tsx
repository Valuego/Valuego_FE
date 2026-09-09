'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuthStatus } from '@/features/auth';
import { useAppSession } from '@/shared/session';

const HomeEntryPage = () => {
  const router = useRouter();
  const session = useAppSession();
  const { isBootstrapping, isAuthenticated, hasCompletedOnboarding } = useAuthStatus();

  useEffect(() => {
    if (session.isGuest && session.activeTripId) {
      router.replace(`/trips/${session.activeTripId}`);
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
      return;
    }
    router.replace('/home');
  }, [hasCompletedOnboarding, isAuthenticated, isBootstrapping, router, session.activeTripId, session.isGuest]);

  return (
    <div className="bg-surface-gray flex min-h-dvh items-center justify-center text-sm text-[rgba(55,56,60,0.61)]">
      가치가자로 이동 중…
    </div>
  );
};

export default HomeEntryPage;
