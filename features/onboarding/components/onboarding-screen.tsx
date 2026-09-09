'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { MobileShell } from '@/shared/components/mobile-shell';
import { cn } from '@/shared/lib/cn';
import { completeOnboarding } from '@/shared/session';

import { ONBOARDING_STEPS } from '../onboarding.constants';
import { StepDots } from './step-dots';

type OnboardingScreenProps = {
  lastCtaLabel?: string;
  onSkip?: () => void;
  onComplete?: () => void;
};

export const OnboardingScreen = ({ lastCtaLabel, onSkip, onComplete }: OnboardingScreenProps) => {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const step = ONBOARDING_STEPS[stepIndex];
  const isLastStep = stepIndex === ONBOARDING_STEPS.length - 1;

  const finish = () => {
    if (onComplete) {
      onComplete();
      return;
    }
    router.push('/welcome');
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
      return;
    }
    completeOnboarding();
    router.push('/home');
  };

  const handleNext = () => {
    if (isLastStep) {
      finish();
      return;
    }
    setStepIndex((prev) => prev + 1);
  };

  return (
    <MobileShell className="from-auth-gradient-from bg-linear-to-b to-white">
      <div className="relative flex flex-1 flex-col px-5">
        <button
          type="button"
          onClick={handleSkip}
          className="text-text-secondary-soft absolute top-6 right-5 z-10 cursor-pointer text-sm leading-[1.5] font-semibold"
        >
          건너뛰기
        </button>

        <div className="flex flex-1 flex-col items-center pt-[72px]">
          <div className="bg-brand-blue/10 flex size-[200px] items-center justify-center overflow-hidden rounded-full">
            <span className="text-[88px] leading-none" aria-hidden>
              {step.emoji}
            </span>
          </div>

          <h1 className="text-ink-900 mt-12 w-full max-w-[340px] text-center text-2xl leading-normal font-bold tracking-[-0.6px]">
            {step.title}
          </h1>
          <p className="text-text-secondary-soft mt-3 w-full max-w-[340px] text-center text-[15px] leading-normal font-medium whitespace-pre-line">
            {step.description}
          </p>
        </div>

        <div className="mt-auto flex flex-col items-center gap-4 pb-6">
          <StepDots stepIds={ONBOARDING_STEPS.map((item) => item.id)} current={stepIndex} />
          <button
            type="button"
            onClick={handleNext}
            className={cn(
              'bg-brand-blue flex h-[52px] w-full cursor-pointer items-center justify-center rounded-xl px-[30px]',
              'text-[15.5px] font-semibold tracking-[-0.3px] text-white',
              'transition-opacity hover:opacity-90 active:opacity-80',
            )}
          >
            {isLastStep && lastCtaLabel ? lastCtaLabel : step.ctaLabel}
          </button>
        </div>
      </div>
    </MobileShell>
  );
};
