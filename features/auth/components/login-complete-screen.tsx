'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { MobileShell } from '@/shared/components/mobile-shell';
import { getErrorMessage } from '@/shared/lib/api';
import { applyAuthenticatedUser, getSessionSnapshot } from '@/shared/session';

import { authQueryKeys, userProfileQueryOptions } from '../auth.api';
import { toSessionUser } from '../auth.lib';

export const LoginCompleteScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;

    const finishLogin = async () => {
      queryClient.removeQueries({ queryKey: authQueryKeys.profile() });
      let lastError: unknown;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          if (attempt > 0) {
            await new Promise((resolve) => {
              window.setTimeout(resolve, 200 * attempt);
            });
          }
          const profile = await queryClient.fetchQuery(userProfileQueryOptions);
          applyAuthenticatedUser(toSessionUser(profile));
          const session = getSessionSnapshot();
          router.replace(session.hasCompletedOnboarding ? '/home' : '/onboarding');
          return;
        } catch (error) {
          lastError = error;
        }
      }
      router.replace(
        `/login?kakaoError=${encodeURIComponent(getErrorMessage(lastError, '로그인 상태를 확인하지 못했어요. 다시 시도해 주세요.'))}`,
      );
    };

    void finishLogin();
  }, [queryClient, router]);

  return (
    <MobileShell className="from-auth-gradient-from bg-linear-to-b to-white">
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-[31px] text-center">
        <p className="text-ink-900 text-lg font-bold">가치가자</p>
        <p className="text-text-secondary-soft text-sm font-medium">로그인하는 중…</p>
      </div>
    </MobileShell>
  );
};
