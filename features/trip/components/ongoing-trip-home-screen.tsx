'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import { Button } from '@/shared/components/button';
import { MobileShell } from '@/shared/components/mobile-shell';
import { TabBar } from '@/shared/components/tab-bar';
import { getErrorMessage } from '@/shared/lib/api';
import { advanceTripPhase } from '@/shared/session';

import type { SchedulePlace } from '../trip.types';

import { rememberActiveTrip, useScheduleQuery, useTripView } from '../trip.hooks';
import { formatVisitTime, getPlaceTypeStyle } from '../trip.lib';

type OngoingTripHomeScreenProps = {
  tripId: string;
};

const getRemainingPlaces = (places: SchedulePlace[]) => {
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const upcoming = places.filter((place) => {
    if (!place.visitTime) {
      return true;
    }
    const [hours, minutes] = place.visitTime.slice(0, 5).split(':').map(Number);
    return (hours ?? 0) * 60 + (minutes ?? 0) >= nowMinutes;
  });
  return upcoming.slice(0, 3);
};

export const OngoingTripHomeScreen = ({ tripId }: OngoingTripHomeScreenProps) => {
  const router = useRouter();
  const { trip, isGuest, isLoading, isError, error } = useTripView(tripId);
  const scheduleQuery = useScheduleQuery(tripId);
  const days = scheduleQuery.data?.days ?? [];
  const firstDay = days[0];
  const remainingPlaces = getRemainingPlaces(firstDay?.places ?? []);
  const nextPlace = remainingPlaces[0];
  const totalSpent = useMemo(() => trip?.expenses.reduce((acc, item) => acc + item.amount, 0) ?? 0, [trip]);

  useEffect(() => {
    if (trip) {
      rememberActiveTrip(trip.id);
    }
  }, [trip]);

  if (isLoading) {
    return (
      <MobileShell className="bg-surface-gray">
        <div className="flex flex-1 items-center justify-center text-sm text-[rgba(55,56,60,0.61)]">
          여행을 불러오는 중…
        </div>
      </MobileShell>
    );
  }

  if (!trip) {
    return (
      <MobileShell className="bg-surface-gray">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 text-center">
          <p className="text-sm font-medium text-[#e08300]">
            {isError ? getErrorMessage(error) : '여행을 찾을 수 없어요.'}
          </p>
          <Button variant="outline" onClick={() => router.push(isGuest ? '/trips/join' : '/home')}>
            {isGuest ? '초대 링크로' : '홈으로'}
          </Button>
        </div>
      </MobileShell>
    );
  }

  const dayNumber = firstDay?.dayNumber ?? 1;
  const nextPlaceLabel = nextPlace
    ? `${formatVisitTime(nextPlace.visitTime)} · ${nextPlace.name ?? '다음 장소'}`
    : trip.dateLabel;

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col pb-4">
        <section className="bg-[linear-gradient(129deg,#171b2e_0%,#26346b_77%)] px-5 pt-16 pb-16">
          <p className="flex items-center gap-1.5 text-xs font-bold text-white">
            <span className="bg-brand-success size-1.5 rounded-full" />
            여행 중 · Day {dayNumber}
          </p>
          <h1 className="mt-2 text-[22px] font-bold tracking-[-0.5px] text-white">{trip.title}</h1>
          <p className="mt-2 text-sm font-medium text-[#c9bcff]">
            {trip.dateLabel} · {nextPlaceLabel}
          </p>
        </section>

        <div className="-mt-10 flex flex-1 flex-col gap-4 px-5">
          <div className="flex gap-2.5">
            <Link
              href={`/trips/${tripId}/games`}
              className="border-line-hairline flex flex-1 flex-col items-center gap-2 rounded-[14px] border bg-white py-3"
            >
              <span className="flex size-[38px] items-center justify-center rounded-xl bg-[rgba(101,65,242,0.08)] text-lg">
                🎮
              </span>
              <span className="text-ink-900 text-sm font-bold">미니게임</span>
              <span className="text-text-secondary-soft text-xs font-medium">결정을 게임으로</span>
            </Link>
            <Link
              href={`/trips/${tripId}/expenses`}
              className="border-line-hairline flex flex-1 flex-col items-center gap-2 rounded-[14px] border bg-white py-3"
            >
              <span className="flex size-[38px] items-center justify-center rounded-xl bg-[rgba(0,189,222,0.1)] text-lg font-medium">
                ₩
              </span>
              <span className="text-ink-900 text-sm font-bold">지출 기록</span>
              <span className="text-text-secondary-soft text-xs font-medium">원탭 기록</span>
            </Link>
            <Link
              href={`/trips/${tripId}/timeline`}
              className="border-line-hairline flex flex-1 flex-col items-center gap-2 rounded-[14px] border bg-white py-3"
            >
              <span className="flex size-[38px] items-center justify-center rounded-xl bg-[rgba(255,146,0,0.1)] text-lg">
                📸
              </span>
              <span className="text-ink-900 text-sm font-bold">타임라인</span>
              <span className="text-text-secondary-soft text-xs font-medium">오늘의 기록</span>
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-text-secondary-soft text-sm font-bold">오늘 남은 일정</p>
            <Link href={`/trips/${tripId}/schedule`} className="text-brand-blue text-sm font-bold">
              전체 일정 보기 →
            </Link>
          </div>

          <ul className="border-line-hairline overflow-hidden rounded-2xl border bg-white">
            {remainingPlaces.length === 0 ? (
              <li className="text-text-secondary-soft px-3.5 py-4 text-sm font-medium">오늘 남은 일정이 없어요</li>
            ) : (
              remainingPlaces.map((place, index) => {
                const style = getPlaceTypeStyle(place.placeType);
                return (
                  <li key={place.travelPlaceId} className={index === 0 ? '' : 'border-line-hairline border-t'}>
                    <Link
                      href={`/trips/${tripId}/schedule/${place.travelPlaceId}`}
                      className="flex items-center gap-3 px-3.5 py-3"
                    >
                      <span className="text-text-secondary-soft w-9 text-xs font-medium">
                        {formatVisitTime(place.visitTime)}
                      </span>
                      <span className="text-lg">{style.emoji}</span>
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="text-ink-900 truncate text-sm font-bold">{place.name ?? '장소'}</span>
                        <span className="text-text-secondary-soft text-xs font-medium">{style.label}</span>
                      </span>
                    </Link>
                  </li>
                );
              })
            )}
          </ul>

          <Link
            href={`/trips/${tripId}/expenses?view=list`}
            className="flex h-[60px] items-center justify-between rounded-[14px] bg-[rgba(51,102,255,0.06)] px-3.5"
          >
            <span className="flex flex-col gap-0.5">
              <span className="text-ink-900 text-sm font-bold">지금까지 쓴 금액</span>
              <span className="text-text-secondary-soft text-xs font-medium">
                {totalSpent.toLocaleString('ko-KR')}원
              </span>
            </span>
            <span className="text-brand-blue text-sm font-bold">보기 →</span>
          </Link>

          {!isGuest ? (
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                advanceTripPhase(tripId, 'settling');
                router.push(`/trips/${tripId}/settlement`);
              }}
            >
              여행 끝 — 정산 시작하기
            </Button>
          ) : null}
        </div>
      </div>
      <TabBar />
    </MobileShell>
  );
};
