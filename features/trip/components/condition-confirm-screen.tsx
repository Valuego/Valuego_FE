'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { InfoBanner } from '@/shared/components/info-banner';
import { MobileShell } from '@/shared/components/mobile-shell';
import { getErrorMessage } from '@/shared/lib/api';
import { DEFAULT_DRAFT, useTripDraft } from '@/shared/session';

import { useCreateTripWithAiSchedule } from '../trip.hooks';

export const ConditionConfirmScreen = () => {
  const router = useRouter();
  const draft = useTripDraft();
  const createTrip = useCreateTripWithAiSchedule();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!draft) {
      router.replace('/trips/new');
    }
  }, [draft, router]);

  const summary = draft ?? DEFAULT_DRAFT;
  const canSubmit = Boolean(summary.startDate && summary.endDate);
  const rows = [
    { label: '목적지', value: summary.destination },
    { label: '기간', value: `${summary.dateLabel} · ${summary.nightsLabel}` },
    { label: '인원', value: `${summary.memberCount}명` },
    { label: '예산', value: summary.budget },
    { label: '음식', value: summary.foods.join(' · ') || '-' },
  ] as const;

  const handleCreate = async () => {
    if (!canSubmit) {
      setErrorMessage('여행 날짜를 다시 선택해 주세요.');
      return;
    }

    setErrorMessage(null);

    try {
      const { group } = await createTrip.mutateAsync({
        destinationLabel: summary.destination,
        title: `${summary.destination} 우정여행`,
        startDate: summary.startDate,
        endDate: summary.endDate,
        memberCount: summary.memberCount,
        transport: summary.transport,
        budgetLabel: summary.budget,
        foodLabels: summary.foods,
        activitySlider: summary.activity,
      });
      router.push(`/trips/${group.groupId}/schedule`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'AI 일정을 만들지 못했어요. 잠시 후 다시 시도해 주세요.'));
    }
  };

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-3 pb-28">
        <Header title="AI 일정 생성 준비" />

        <ul className="border-line-hairline overflow-hidden rounded-2xl border bg-white px-[18px]">
          {rows.map((row) => (
            <li
              key={row.label}
              className="border-line-hairline flex items-center justify-between border-b py-[15px] last:border-b-0"
            >
              <span className="text-text-secondary-soft text-sm font-medium">{row.label}</span>
              <span className="text-ink-900 text-sm font-bold">{row.value}</span>
            </li>
          ))}
        </ul>

        <InfoBanner
          accent="purple"
          message="AI가 성향과 동선을 반영해 일정을 만들어요. 최대 2분 정도 걸릴 수 있어요."
        />
        {errorMessage ? <p className="text-sm font-medium text-[#e08300]">{errorMessage}</p> : null}
      </div>

      <div className="bg-surface-gray fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[430px] px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <Button
          variant="primary"
          fullWidth
          disabled={createTrip.isPending || !canSubmit}
          onClick={() => void handleCreate()}
        >
          {createTrip.isPending ? 'AI가 일정을 만드는 중…' : 'AI 일정 생성하기'}
        </Button>
      </div>

      {createTrip.isPending ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="mx-6 w-full max-w-[340px] rounded-2xl bg-white px-6 py-8 text-center">
            <p className="text-[40px]" aria-hidden>
              ✨
            </p>
            <p className="text-ink-900 mt-3 text-lg font-bold">AI가 동선을 짜고 있어요</p>
            <p className="text-text-secondary-soft mt-2 text-sm font-medium">
              관광 정보와 그룹 성향을 반영하는 중이라
              <br />
              잠시만 기다려 주세요.
            </p>
          </div>
        </div>
      ) : null}
    </MobileShell>
  );
};
