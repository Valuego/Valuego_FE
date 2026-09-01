'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { MobileShell } from '@/shared/components/mobile-shell';
import { getErrorMessage } from '@/shared/lib/api';
import { getSessionSnapshot } from '@/shared/session';

import { useLoginWithKakaoCode } from '../auth.hooks';

export const KakaoCallbackScreen = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMutation = useLoginWithKakaoCode();
  const startedRef = useRef(false);
  const code = searchParams.get('code');
  const errorDescription = searchParams.get('error_description') ?? searchParams.get('error');

  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    if (!code) {
      return;
    }

    startedRef.current = true;
    void loginMutation.mutateAsync(code).then(() => {
      const session = getSessionSnapshot();
      router.replace(session.hasCompletedOnboarding ? '/home' : '/onboarding');
    });
  }, [code, loginMutation, router]);

  const message = errorDescription
    ? errorDescription
    : !code
      ? '카카오 인가 코드가 없습니다. 다시 로그인해 주세요.'
      : loginMutation.isError
        ? getErrorMessage(loginMutation.error, '카카오 로그인에 실패했어요.')
        : '카카오 로그인 처리 중…';

  return (
    <MobileShell className="from-auth-gradient-from bg-linear-to-b to-white">
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-[31px] text-center">
        <p className="text-ink-900 text-lg font-bold">가치가자</p>
        <p className="text-text-secondary-soft text-sm font-medium">{message}</p>
      </div>
    </MobileShell>
  );
};
