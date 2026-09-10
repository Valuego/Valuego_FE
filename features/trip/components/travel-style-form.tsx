'use client';

import { useState } from 'react';

import { BUDGET_OPTIONS, FOOD_OPTIONS } from '@/features/home/home.constants';
import { Button } from '@/shared/components/button';
import { Chip } from '@/shared/components/chip';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { ProgressBar } from '@/shared/components/progress-bar';
import { Slider } from '@/shared/components/slider';

type TravelStyleFormProps = {
  onBack?: () => void;
  onSubmit: (value: { budget: string; foods: string[]; activity: number }) => void;
  submitLabel: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  showProgress?: boolean;
};

export const TravelStyleForm = ({
  onBack,
  onSubmit,
  submitLabel,
  isSubmitting = false,
  errorMessage,
  showProgress = false,
}: TravelStyleFormProps) => {
  const [budget, setBudget] = useState<(typeof BUDGET_OPTIONS)[number]>('적당히');
  const [foods, setFoods] = useState<string[]>(['한식']);
  const [activity, setActivity] = useState(52);
  const canSubmit = foods.length > 0 && !isSubmitting;

  const toggleFood = (food: string) => {
    setFoods((prev) => (prev.includes(food) ? prev.filter((item) => item !== food) : [...prev, food]));
  };

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-3 pb-28">
        <Header title="여행 스타일 정하기" onBack={onBack} />
        {showProgress ? (
          <div className="flex items-center gap-2.5">
            <ProgressBar value={66} className="flex-1" />
            <span className="text-text-placeholder text-[12.5px] font-bold">2/3</span>
          </div>
        ) : null}

        <section className="border-line-hairline flex flex-col gap-3.5 rounded-2xl border bg-white p-[18px]">
          <h2 className="text-ink-900 text-base font-bold tracking-[-0.2px]">예산</h2>
          <div className="flex gap-2">
            {BUDGET_OPTIONS.map((option) => (
              <Chip
                key={option}
                label={option}
                selected={budget === option}
                onClick={() => setBudget(option)}
                className="min-w-0 flex-1"
              />
            ))}
          </div>
        </section>

        <section className="border-line-hairline flex flex-col gap-3.5 rounded-2xl border bg-white p-[18px]">
          <h2 className="text-ink-900 text-base font-bold tracking-[-0.2px]">선호 음식</h2>
          <div className="flex gap-2">
            {FOOD_OPTIONS.map((option) => (
              <Chip
                key={option}
                label={option}
                selected={foods.includes(option)}
                onClick={() => toggleFood(option)}
                className="min-w-0 flex-1"
              />
            ))}
          </div>
        </section>

        <section className="border-line-hairline flex flex-col gap-3.5 rounded-2xl border bg-white p-[18px]">
          <h2 className="text-ink-900 text-base font-bold tracking-[-0.2px]">활동 강도</h2>
          <Slider value={activity} onValueChange={setActivity} />
          <div className="text-text-secondary-soft flex items-center justify-between text-[12.5px] font-medium">
            <span>여유롭게</span>
            <span>알차게</span>
          </div>
        </section>

        {errorMessage ? <p className="text-sm font-medium text-[#e08300]">{errorMessage}</p> : null}
      </div>

      <div className="bg-surface-gray fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[430px] px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <Button variant="primary" fullWidth disabled={!canSubmit} onClick={() => onSubmit({ budget, foods, activity })}>
          {isSubmitting ? '저장하는 중…' : submitLabel}
        </Button>
      </div>
    </MobileShell>
  );
};
