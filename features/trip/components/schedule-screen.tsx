'use client';

import { useQueries } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { getErrorMessage, isApiError } from '@/shared/lib/api';
import { cn } from '@/shared/lib/cn';

import type { ScheduleDay } from '../trip.types';

import { placeVoteQueryOptions } from '../trip.api';
import { rememberActiveTrip, useGenerateAiSchedule, useScheduleQuery, useTripView } from '../trip.hooks';
import { formatVisitTime, getPlaceTypeStyle, parseGroupId } from '../trip.lib';

const EMPTY_DAYS: ScheduleDay[] = [];

type ScheduleScreenProps = {
  tripId: string;
};

export const ScheduleScreen = ({ tripId }: ScheduleScreenProps) => {
  const router = useRouter();
  const { trip, isGuest, isLoading: isTripLoading } = useTripView(tripId);
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
  const voteQueries = useQueries({
    queries: (activeDay?.places ?? []).map((place) => placeVoteQueryOptions(place.travelPlaceId)),
  });

  const notFound = isApiError(scheduleQuery.error) && scheduleQuery.error.errorData?.code === 'TRAVEL-001';
  const errorMessage = scheduleQuery.isError && !notFound ? getErrorMessage(scheduleQuery.error) : null;
  const totalDistance = activeDay?.totalDistanceKm;

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
        <Header
          title={trip ? `${trip.destination} 일정 초안` : 'AI 일정'}
          onBack={() => router.push(trip ? `/trips/${trip.id}` : '/home')}
        />

        {days.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto">
            {days.map((day) => {
              const isActive = day.dayNumber === activeDay?.dayNumber;
              return (
                <button
                  key={`day-${day.dayNumber}`}
                  type="button"
                  className={cn(
                    'flex flex-col items-center rounded-[11px] px-3.5 py-2',
                    isActive ? 'bg-ink-900 text-white' : 'bg-[rgba(112,115,132,0.08)] text-[rgba(46,47,51,0.88)]',
                  )}
                  onClick={() => setSelectedDay(day.dayNumber)}
                >
                  <span className="text-[13.5px] font-bold">Day {day.dayNumber}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        {activeDay ? (
          <p className="text-ink-900 text-center text-sm font-medium">
            경유지 {activeDay.places.length}곳
            {typeof totalDistance === 'number' ? ` · ${totalDistance.toFixed(1)}km` : ''}
            {trip?.transport === 'car' ? ' · 렌터카' : trip?.transport === 'transit' ? ' · 대중교통' : ''}
          </p>
        ) : null}

        {scheduleQuery.isPending ? (
          <p className="text-text-secondary-soft text-sm font-medium">일정을 불러오는 중…</p>
        ) : null}

        {notFound ? (
          <div className="border-line-hairline rounded-2xl border bg-white p-[18px]">
            <p className="text-ink-900 text-sm font-bold">아직 생성된 일정이 없어요</p>
            <p className="text-text-secondary-soft mt-1 text-[12.5px] font-medium">
              {isGuest ? '호스트가 일정을 만들면 여기서 구경할 수 있어요.' : 'AI 일정 생성을 다시 시도할 수 있어요.'}
            </p>
            {!isGuest ? (
              <Button
                variant="primary"
                fullWidth
                className="mt-4"
                disabled={generateSchedule.isPending}
                onClick={() => void handleRetry()}
              >
                {generateSchedule.isPending ? '다시 만드는 중…' : 'AI 일정 다시 만들기'}
              </Button>
            ) : null}
            {generateSchedule.isError ? (
              <p className="mt-2 text-sm font-medium text-[#e08300]">{getErrorMessage(generateSchedule.error)}</p>
            ) : null}
          </div>
        ) : null}

        {errorMessage ? <p className="text-sm font-medium text-[#e08300]">{errorMessage}</p> : null}

        {activeDay ? (
          <ul className="flex flex-col gap-3">
            {activeDay.places.map((place, placeIndex) => {
              const typeStyle = getPlaceTypeStyle(place.placeType);
              const vote = voteQueries[placeIndex]?.data;
              return (
                <li key={place.travelPlaceId} className="flex items-start gap-2.5">
                  <p className="text-text-secondary-soft w-[38px] shrink-0 pt-4 text-right text-[11.5px] font-bold">
                    {formatVisitTime(place.visitTime)}
                  </p>
                  <button
                    type="button"
                    className="border-line-hairline flex min-w-0 flex-1 gap-3 rounded-[14px] border bg-white px-3.5 py-3 text-left"
                    onClick={() => router.push(`/trips/${tripId}/schedule/${place.travelPlaceId}`)}
                  >
                    {place.imageUrl ? (
                      <Image
                        src={place.imageUrl}
                        alt=""
                        width={80}
                        height={80}
                        unoptimized
                        className="size-20 shrink-0 rounded-[14px] object-cover"
                      />
                    ) : (
                      <div
                        className={cn(
                          'flex size-20 shrink-0 items-center justify-center rounded-[14px] text-[40px]',
                          typeStyle.thumbClassName,
                        )}
                      >
                        <span aria-hidden>{typeStyle.emoji}</span>
                      </div>
                    )}
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <p className="text-ink-900 min-w-0 flex-1 truncate text-[14.5px] font-bold">
                          {place.name ?? '장소 정보 없음'}
                        </p>
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium',
                            typeStyle.pillClassName,
                          )}
                        >
                          {typeStyle.label}
                        </span>
                      </div>
                      {place.address ? (
                        <p className="text-text-secondary-soft truncate text-xs font-medium">{place.address}</p>
                      ) : null}
                      {vote ? (
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-full bg-[rgba(112,115,132,0.06)] px-2 py-1 text-[11px] font-semibold text-[rgba(55,56,60,0.61)]">
                            👍 {vote.likeCount}
                          </span>
                          <span className="rounded-full bg-[rgba(112,115,132,0.06)] px-2 py-1 text-[11px] font-semibold text-[rgba(55,56,60,0.61)]">
                            👎 {vote.dislikeCount}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <div className="bg-surface-gray fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[430px] px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        {isGuest ? (
          <Button variant="primary" fullWidth onClick={() => router.push(`/trips/${tripId}`)}>
            대기실로
          </Button>
        ) : (
          <Button variant="primary" fullWidth onClick={() => router.push(`/trips/${tripId}/invite`)}>
            친구 초대하기
          </Button>
        )}
      </div>
    </MobileShell>
  );
};
