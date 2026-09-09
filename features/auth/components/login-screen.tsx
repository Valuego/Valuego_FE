'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { MobileShell } from '@/shared/components/mobile-shell';
import { getErrorMessage } from '@/shared/lib/api';
import { getSessionSnapshot } from '@/shared/session';

import { getKakaoAuthorizeUrl } from '../auth.api';
import { startKakaoLogin, useAuthStatus, useLoginWithTestAccount } from '../auth.hooks';
import { isKakaoRedirectOriginMismatch } from '../auth.lib';
import { BrandLogo } from './brand-logo';
import { KakaoLoginButton } from './kakao-login-button';

type LoginScreenProps = {
  kakaoErrorFromCallback?: string | null;
};

export const LoginScreen = ({ kakaoErrorFromCallback = null }: LoginScreenProps) => {
  const router = useRouter();
  const { isAuthenticated, hasCompletedOnboarding, isBootstrapping } = useAuthStatus();
  const testLogin = useLoginWithTestAccount();
  const [kakaoError, setKakaoError] = useState<string | null>(kakaoErrorFromCallback);
  const kakaoReady = Boolean(getKakaoAuthorizeUrl());

  useEffect(() => {
    if (isBootstrapping || !isAuthenticated) {
      return;
    }
    router.replace(hasCompletedOnboarding ? '/home' : '/onboarding');
  }, [hasCompletedOnboarding, isAuthenticated, isBootstrapping, router]);

  const redirectAfterLogin = () => {
    const session = getSessionSnapshot();
    router.push(session.hasCompletedOnboarding ? '/home' : '/onboarding');
  };

  const handleKakaoLogin = () => {
    try {
      setKakaoError(null);
      startKakaoLogin();
    } catch (error) {
      setKakaoError(getErrorMessage(error, '카카오 로그인을 시작할 수 없어요.'));
    }
  };

  const handleTestLogin = async () => {
    try {
      await testLogin.mutateAsync();
      redirectAfterLogin();
    } catch {
      // mutation error is rendered below
    }
  };

  const originMismatch = isKakaoRedirectOriginMismatch();
  const errorMessage =
    kakaoError ??
    (originMismatch
      ? '카카오 로그인은 등록된 주소(http://localhost:3000)로 접속해야 합니다. IP나 배포 도메인에서는 KOE006이 납니다.'
      : null) ??
    (testLogin.isError ? getErrorMessage(testLogin.error) : null);

  return (
    <MobileShell className="from-auth-gradient-from bg-linear-to-b to-white">
      <div className="flex flex-1 flex-col items-center justify-center gap-3.5 px-[31px]">
        <BrandLogo priority />
        <h1 className="text-ink-900 text-[26px] leading-normal font-bold tracking-[-0.6px]">시작하기</h1>
        <p className="text-text-secondary-soft text-sm leading-[1.5] font-semibold">
          3초 만에 가입하고 우정여행을 시작해요
        </p>
        <KakaoLoginButton className="mt-1 w-full max-w-[340px]" disabled={!kakaoReady} onClick={handleKakaoLogin} />
        <button
          type="button"
          className="text-text-secondary-soft mt-1 w-full max-w-[340px] cursor-pointer text-sm font-semibold underline-offset-2 hover:underline"
          disabled={testLogin.isPending}
          onClick={() => void handleTestLogin()}
        >
          {testLogin.isPending ? '테스트 계정 로그인 중…' : '테스트 계정으로 시작하기'}
        </button>
        {errorMessage ? <p className="text-sm font-medium text-[#e08300]">{errorMessage}</p> : null}
        {!kakaoReady ? (
          <p className="text-text-secondary-soft text-center text-xs font-medium">
            카카오 로그인은 `NEXT_PUBLIC_KAKAO_CLIENT_ID` 설정 후 사용할 수 있어요.
          </p>
        ) : null}
      </div>
    </MobileShell>
  );
};
