'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { getErrorMessage, isApiError } from '@/shared/lib/api';

import type { ScheduleDay } from '../trip.types';

import { rememberActiveTrip, useGenerateAiSchedule, useScheduleQuery, useTripView } from '../trip.hooks';
import { parseGroupId } from '../trip.lib';

const EMPTY_DAYS: ScheduleDay[] = [];

type ScheduleScreenProps = {
  tripId: string;
};

export const ScheduleScreen = ({ tripId }: ScheduleScreenProps) => {
  const router = useRouter();
  const { trip, isLoading: isTripLoading } = useTripView(tripId);
  const scheduleQuery = useScheduleQuery(tripId);
  const groupId = parseGroupId(tripId) ?? 0;
  const generateSchedule = useGenerateAiSchedule(groupId);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    rememberActiveTrip(tripId);
  }, [tripId]);

  const days = scheduleQuery.data?.days ?? EMPTY_DAYS;
  const activeDayNumber = selectedDay ?? days[0]?.dayNumber ?? 1;
  const activeDay = days.find((day) => day.dayNumber === activeDayNumber) ?? days[0];

  const notFound = isApiError(scheduleQuery.error) && scheduleQuery.error.errorData?.code === 'TRAVEL-001';
  const errorMessage = scheduleQuery.isError && !notFound ? getErrorMessage(scheduleQuery.error) : null;

  const handleRetry = async () => {
    if (!groupId) {
      return;
    }
    try {
      await generateSchedule.mutateAsync();
    } catch {
      // mutation error is rendered below
    }
  };

  if (isTripLoading) {
    return (
      <MobileShell className="bg-surface-gray">
        <div className="flex flex-1 items-center justify-center text-sm text-[rgba(55,56,60,0.61)]">
          일정을 불러오는 중…
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-3 pb-28">
        <Header title="AI 일정" onBack={() => router.push(trip ? `/trips/${trip.id}` : '/home')} />

        <section className="border-line-hairline rounded-2xl border bg-white px-5 py-5">
          <p className="text-text-secondary-soft text-xs font-bold">{trip?.dDayLabel ?? '일정'}</p>
          <h2 className="text-ink-900 mt-1 text-[22px] font-bold tracking-[-0.5px]">{trip?.title ?? '여행 일정'}</h2>
          <p className="text-text-secondary-soft mt-1 text-sm font-medium">
            {trip ? `${trip.dateLabel} · ${trip.destination}` : '생성된 일정을 확인해 보세요'}
          </p>
        </section>

        {scheduleQuery.isPending ? (
          <p className="text-text-secondary-soft text-sm font-medium">일정을 불러오는 중…</p>
        ) : null}

        {notFound ? (
          <div className="border-line-hairline rounded-2xl border bg-white p-[18px]">
            <p className="text-ink-900 text-sm font-bold">아직 생성된 일정이 없어요</p>
            <p className="text-text-secondary-soft mt-1 text-[12.5px] font-medium">
              AI 일정 생성을 다시 시도할 수 있어요.
            </p>
            <Button
              variant="primary"
              fullWidth
              className="mt-4"
              disabled={generateSchedule.isPending}
              onClick={() => void handleRetry()}
            >
              {generateSchedule.isPending ? '다시 만드는 중…' : 'AI 일정 다시 만들기'}
            </Button>
            {generateSchedule.isError ? (
              <p className="mt-2 text-sm font-medium text-[#e08300]">{getErrorMessage(generateSchedule.error)}</p>
            ) : null}
          </div>
        ) : null}

        {errorMessage ? <p className="text-sm font-medium text-[#e08300]">{errorMessage}</p> : null}

        {days.length > 0 ? (
          <>
            <div className="flex gap-2 overflow-x-auto">
              {days.map((day) => (
                <button
                  key={`day-${day.dayNumber}`}
                  type="button"
                  className={`rounded-full px-3.5 py-2 text-sm font-bold ${
                    day.dayNumber === activeDay?.dayNumber
                      ? 'bg-brand-blue text-white'
                      : 'text-ink-900 border-line-hairline border bg-white'
                  }`}
                  onClick={() => setSelectedDay(day.dayNumber)}
                >
                  {day.dayNumber}일차
                </button>
              ))}
            </div>

            {activeDay ? (
              <ul className="flex flex-col gap-2.5">
                {activeDay.places.map((place) => (
                  <li
                    key={place.travelPlaceId}
                    className="border-line-hairline rounded-2xl border bg-white px-[18px] py-4"
                  >
                    <p className="text-brand-blue text-xs font-bold">
                      {place.visitTime ?? '시간 미정'} · {place.placeType ?? '장소'}
                    </p>
                    <p className="text-ink-900 mt-1 text-[15px] font-bold">{place.name ?? '장소 정보 없음'}</p>
                    {place.address ? (
                      <p className="text-text-secondary-soft mt-1 text-[12.5px] font-medium">{place.address}</p>
                    ) : null}
                    {place.reason ? (
                      <p className="text-text-secondary-soft mt-2 text-[12.5px] font-medium">{place.reason}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : null}
      </div>

      <div className="bg-surface-gray fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[430px] px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <Button variant="primary" fullWidth onClick={() => router.push(`/trips/${tripId}/invite`)}>
          친구 초대하기
        </Button>
      </div>
    </MobileShell>
  );
};
