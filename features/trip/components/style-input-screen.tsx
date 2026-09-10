'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { BUDGET_OPTIONS, FOOD_OPTIONS } from '@/features/home/home.constants';
import { Button } from '@/shared/components/button';
import { Chip } from '@/shared/components/chip';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { Slider } from '@/shared/components/slider';
import { updateTripDraft, useTripDraft } from '@/shared/session';

export const StyleInputScreen = () => {
  const router = useRouter();
  const draft = useTripDraft();
  const [budget, setBudget] = useState<(typeof BUDGET_OPTIONS)[number]>(
    (draft?.budget as (typeof BUDGET_OPTIONS)[number]) ?? '적당히',
  );
  const [food, setFood] = useState<string>(draft?.foods?.[0] ?? '한식');
  const [activity, setActivity] = useState(draft?.activity ?? 52);

  const handleSubmit = () => {
    updateTripDraft({ budget, foods: [food], activity });
    router.push('/trips/new/confirm');
  };

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-3 pb-28">
        <Header title="여행 스타일 정하기" />

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
                selected={food === option}
                onClick={() => setFood(option)}
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
      </div>

      <div className="bg-surface-gray fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[430px] px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <Button variant="primary" fullWidth onClick={handleSubmit}>
          AI 일정 조건 확인하기
        </Button>
      </div>
    </MobileShell>
  );
};
