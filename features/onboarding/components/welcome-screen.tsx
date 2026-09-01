'use client';

import { useRouter } from 'next/navigation';

import { BrandLogo, KakaoLoginButton } from '@/features/auth';
import { MobileShell } from '@/shared/components/mobile-shell';
import { cn } from '@/shared/lib/cn';
import { completeOnboarding } from '@/shared/session';

import { WELCOME_FEATURES } from '../onboarding.constants';

export const WelcomeScreen = () => {
  const router = useRouter();

  const handleKakaoLogin = () => {
    // TODO: 카카오 OAuth 연동
    completeOnboarding();
    router.push('/home');
  };

  return (
    <MobileShell className="from-auth-gradient-from-soft bg-linear-to-b via-white to-white">
      <div className="flex flex-1 flex-col px-6 pt-10">
        <div className="flex flex-col items-center">
          <BrandLogo priority className="h-[104px] w-[287px]" />
        </div>

        <div className="mt-3.5 flex flex-col gap-3.5">
          <h1 className="text-ink-900 text-center text-[30px] leading-[1.32] font-bold tracking-[-0.8px]">
            수고까지 나누는 우정여행
          </h1>
          <p className="text-text-secondary-soft text-center text-[14.5px] leading-[1.55] font-medium">
            AI가 일정을 짜고 애매한 결정은 게임으로,
            <br />
            보이지 않는 수고까지 함께 정산해요.
          </p>
        </div>

        <ul className="mt-5 flex flex-col gap-3 pt-1.5">
          {WELCOME_FEATURES.map((feature) => (
            <li key={feature.id} className="flex items-center gap-[13px]">
              <div
                className={cn(
                  'flex size-[46px] shrink-0 items-center justify-center rounded-[13px] text-[15px] font-bold',
                  feature.badgeClassName,
                )}
              >
                {feature.badge}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="text-ink-900 text-[14.5px] leading-normal font-bold">{feature.title}</p>
                <p className="text-text-secondary-soft text-[12.5px] leading-normal font-medium">
                  {feature.description}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-8 pb-6">
          <KakaoLoginButton onClick={handleKakaoLogin} />
        </div>
      </div>
    </MobileShell>
  );
};
