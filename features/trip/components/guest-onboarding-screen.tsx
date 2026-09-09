'use client';

import { useRouter } from 'next/navigation';

import { OnboardingScreen } from '@/features/onboarding';

import { buildInvitePath } from '../trip.lib';

type GuestOnboardingScreenProps = {
  code: string;
};

export const GuestOnboardingScreen = ({ code }: GuestOnboardingScreenProps) => {
  const router = useRouter();

  const goProfile = () => {
    router.push(`${buildInvitePath(code)}/profile`);
  };

  return <OnboardingScreen lastCtaLabel="시작하기" onSkip={goProfile} onComplete={goProfile} />;
};
