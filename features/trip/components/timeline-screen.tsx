'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { advanceTripPhase } from '@/shared/session';

import { rememberActiveTrip, useScheduleQuery, useTripView } from '../trip.hooks';
import { formatVisitTime, getPlaceTypeStyle } from '../trip.lib';

type TimelineScreenProps = {
  tripId: string;
};

type TimelineItem = {
  id: string;
  title: string;
  description: string;
  timeLabel: string;
  emoji: string;
  thumbClassName: string;
};

export const TimelineScreen = ({ tripId }: TimelineScreenProps) => {
  const router = useRouter();
  const { trip, isGuest, isLoading } = useTripView(tripId);
  const scheduleQuery = useScheduleQuery(tripId);
  const firstDay = scheduleQuery.data?.days[0];
  const totalSpent = useMemo(() => trip?.expenses.reduce((acc, item) => acc + item.amount, 0) ?? 0, [trip]);

  useEffect(() => {
    rememberActiveTrip(tripId);
  }, [tripId]);

  useEffect(() => {
    if (!isLoading && !trip) {
      router.replace('/home');
    }
  }, [isLoading, router, trip]);

  if (isLoading) {
    return (
      <MobileShell className="bg-surface-gray">
        <div className="flex flex-1 items-center justify-center text-sm text-[rgba(55,56,60,0.61)]">
          타임라인을 불러오는 중…
        </div>
      </MobileShell>
    );
  }

  if (!trip) {
    return null;
  }

  const placeItems: TimelineItem[] = (firstDay?.places ?? []).map((place) => {
    const style = getPlaceTypeStyle(place.placeType);
    return {
      id: `place-${place.travelPlaceId}`,
      title: place.name ?? '장소',
      description: style.label,
      timeLabel: formatVisitTime(place.visitTime),
      emoji: style.emoji,
      thumbClassName: style.thumbClassName,
    };
  });

  const gameItems: TimelineItem[] = trip.timeline.map((entry) => ({
    id: entry.id,
    title: `${entry.winnerName} 당첨`,
    description: entry.label,
    timeLabel: new Date(entry.createdAt).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
    emoji: entry.game === 'ladder' ? '🪜' : '🎯',
    thumbClassName: entry.game === 'ladder' ? 'bg-[#fff3db]' : 'bg-[#eff3ff]',
  }));

  const items = [...placeItems, ...gameItems];

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-3 px-5 pt-3 pb-28">
        <div className="flex items-center justify-between">
          <Header title="타임라인" onBack={() => router.push(`/trips/${tripId}`)} />
          <span className="rounded-full bg-[rgba(51,102,255,0.08)] px-2.5 py-1 text-[11px] font-bold text-[#3366ff]">
            Day {firstDay?.dayNumber ?? 1}
          </span>
        </div>

        {items.length === 0 ? (
          <p className="text-text-secondary-soft text-sm font-medium">아직 오늘의 기록이 없어요.</p>
        ) : (
          items.map((item) => (
            <article
              key={item.id}
              className="border-line-hairline flex items-start gap-3 rounded-[14px] border bg-white px-3.5 py-3"
            >
              <div
                className={`flex size-[42px] shrink-0 items-center justify-center rounded-xl text-lg ${item.thumbClassName}`}
              >
                {item.emoji}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-ink-900 truncate text-base font-bold tracking-[-0.2px]">{item.title}</p>
                  <p className="text-text-secondary-soft shrink-0 text-xs font-medium">{item.timeLabel}</p>
                </div>
                <p className="text-text-secondary-soft text-sm leading-[1.5]">{item.description}</p>
              </div>
            </article>
          ))
        )}

        <p className="rounded-xl bg-[rgba(51,102,255,0.06)] px-3.5 py-3 text-xs font-medium text-[rgba(55,56,60,0.61)]">
          오늘 지출 총 {totalSpent.toLocaleString('ko-KR')}원 · 자동 정산 대기 중
        </p>
      </div>
      {!isGuest ? (
        <div className="bg-surface-gray fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[430px] px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
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
        </div>
      ) : null}
    </MobileShell>
  );
};
