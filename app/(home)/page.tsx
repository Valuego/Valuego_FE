'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { authQueryKeys, useAuthStatus } from '@/features/auth';
import { useAppSession } from '@/shared/session';

const HomeEntryPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const session = useAppSession();
  const { isBootstrapping, isAuthenticated, hasCompletedOnboarding } = useAuthStatus();

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: authQueryKeys.profile() });
  }, [queryClient]);

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
