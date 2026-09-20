'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { InfoBanner } from '@/shared/components/info-banner';
import { MobileShell } from '@/shared/components/mobile-shell';
import { getErrorMessage } from '@/shared/lib/api';

import { rememberActiveTrip, useGenerateAiSchedule, useStyleCardQuery, useTripView } from '../trip.hooks';
import { budgetToLabel, buildTripHref, foodToLabel, parseGroupId } from '../trip.lib';
import { AiScheduleGeneratingScreen } from './ai-schedule-generating-screen';

type AiSchedulePrepScreenProps = {
  tripId: string;
};

const PrepRow = ({ label, value, divider = true }: { label: string; value: string; divider?: boolean }) => {
  return (
    <div
      className={
        divider
          ? 'border-line-hairline flex items-center justify-between border-b py-[15px]'
          : 'flex items-center justify-between py-[15px]'
      }
    >
      <p className="text-text-secondary-soft text-sm font-medium">{label}</p>
      <p className="text-ink-900 text-sm font-bold">{value}</p>
    </div>
  );
};

export const AiSchedulePrepScreen = ({ tripId }: AiSchedulePrepScreenProps) => {
  const router = useRouter();
  const { trip, isGuest, isLoading } = useTripView(tripId);
  const groupId = parseGroupId(tripId) ?? 0;
  const styleQuery = useStyleCardQuery(tripId, Boolean(groupId) && !isGuest);
  const generateSchedule = useGenerateAiSchedule(groupId);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    rememberActiveTrip(tripId);
  }, [tripId]);

  useEffect(() => {
    if (isGuest) {
      router.replace(buildTripHref(tripId));
    }
  }, [isGuest, router, tripId]);

  const handleGenerate = async () => {
    if (!groupId) {
      router.replace(buildTripHref(tripId, 'schedule'));
      return;
    }
    setErrorMessage(null);
    try {
      await generateSchedule.mutateAsync();
      router.replace(buildTripHref(tripId, 'schedule'));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, '일정을 만들지 못했어요. 잠시 후 다시 시도해 주세요.'));
    }
  };

  if (generateSchedule.isPending) {
    return <AiScheduleGeneratingScreen />;
  }

  if (isLoading) {
    return (
      <MobileShell className="bg-surface-gray">
        <div className="flex flex-1 items-center justify-center text-sm text-[rgba(55,56,60,0.61)]">
          일정 조건을 불러오는 중…
        </div>
      </MobileShell>
    );
  }

  const budget = styleQuery.data ? budgetToLabel(styleQuery.data.budgetType) : trip?.budget || '적당히';
  const food = styleQuery.data ? foodToLabel(styleQuery.data.foodType) : trip?.foods[0] || '한식';

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-3 pb-28">
        <Header title="AI 일정 생성 준비" onBack={() => router.push(buildTripHref(tripId, 'style'))} />

        <section className="border-line-hairline overflow-hidden rounded-2xl border bg-white px-[18px]">
          <PrepRow label="목적지" value={trip?.destination ?? '부산'} />
          <PrepRow label="기간" value={trip?.nightsLabel ?? '기간 미정'} />
          <PrepRow label="인원" value={`${trip?.memberCount ?? 0}명`} />
          <PrepRow label="예산" value={budget} />
          <PrepRow label="음식" value={food} divider={false} />
        </section>

        <InfoBanner accent="blue" emoji="✨" message="AI가 성향과 동선을 반영해 일정을 만들어요." />
        {errorMessage ? <p className="text-sm font-medium text-[#e08300]">{errorMessage}</p> : null}
      </div>

      <div className="bg-surface-gray fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[430px] px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <Button variant="primary" fullWidth onClick={() => void handleGenerate()}>
          AI 일정 생성하기
        </Button>
      </div>
    </MobileShell>
  );
};
