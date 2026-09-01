'use client';

import { useRouter } from 'next/navigation';

import { MobileShell } from '@/shared/components/mobile-shell';
import { getSessionSnapshot, login } from '@/shared/session';

import { BrandLogo } from './brand-logo';
import { KakaoLoginButton } from './kakao-login-button';

export const LoginScreen = () => {
  const router = useRouter();

  const handleKakaoLogin = () => {
    // TODO: 카카오 OAuth 연동
    login();
    const session = getSessionSnapshot();
    router.push(session.hasCompletedOnboarding ? '/home' : '/onboarding');
  };

  return (
    <MobileShell className="from-auth-gradient-from bg-linear-to-b to-white">
      <div className="flex flex-1 flex-col items-center justify-center gap-3.5 px-[31px]">
        <BrandLogo priority />
        <h1 className="text-ink-900 text-[26px] leading-normal font-bold tracking-[-0.6px]">시작하기</h1>
        <p className="text-text-secondary-soft text-sm leading-[1.5] font-semibold">
          3초 만에 가입하고 우정여행을 시작해요
        </p>
        <KakaoLoginButton className="mt-1 w-full max-w-[340px]" onClick={handleKakaoLogin} />
      </div>
    </MobileShell>
  );
};
