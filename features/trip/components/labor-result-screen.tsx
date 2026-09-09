'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { Avatar } from '@/shared/components/avatar';
import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';

import { rememberActiveTrip, useTripView } from '../trip.hooks';
import { laborRewardFor } from '../trip.lib';

type LaborResultScreenProps = {
  tripId: string;
};

const SAMPLE_NOTES = ['운전 정말 고마웠어 🚗', '예약 다 해줘서 편했어!', '다음에도 너만 믿는다 ㅋㅋ'];

export const LaborResultScreen = ({ tripId }: LaborResultScreenProps) => {
  const router = useRouter();
  const { trip, isLoading } = useTripView(tripId);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (trip) {
      rememberActiveTrip(trip.id);
    }
  }, [trip]);

  useEffect(() => {
    if (!isLoading && !trip) {
      router.replace('/home');
    }
  }, [isLoading, router, trip]);

  const members = trip?.members ?? [];
  const current = members[index];
  const notes = useMemo(() => {
    if (!trip || !current) {
      return SAMPLE_NOTES;
    }
    const saved = trip.laborValues.find((item) => item.memberId === current.id)?.note;
    return saved ? [saved, ...SAMPLE_NOTES.filter((item) => item !== saved)].slice(0, 3) : SAMPLE_NOTES;
  }, [current, trip]);

  if (isLoading || !trip || !current) {
    return (
      <MobileShell className="bg-surface-gray">
        <div className="flex flex-1 items-center justify-center text-sm text-[rgba(55,56,60,0.61)]">
          수고 결과를 불러오는 중…
        </div>
      </MobileShell>
    );
  }

  const reward = laborRewardFor(trip, current.id);
  const evaluatorCount = Math.max(1, trip.members.length - 1);

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-3.5 px-5 pt-3 pb-28">
        <Header title="수고 가치" onBack={() => router.push(`/trips/${tripId}/settlement/status`)} />

        <div className="relative flex items-center justify-center pt-2">
          <button
            type="button"
            aria-label="이전"
            className="absolute left-0 flex size-11 items-center justify-center rounded-full bg-white text-lg"
            disabled={index === 0}
            onClick={() => setIndex((prev) => Math.max(0, prev - 1))}
          >
            ‹
          </button>
          <section
            className="flex w-[248px] flex-col items-center gap-1.5 rounded-[20px] py-7"
            style={{ backgroundImage: 'linear-gradient(90deg, #2f2f2f 0%, #6541f2 100%)' }}
          >
            <Avatar member={current.member} size="md" initial={current.name.slice(0, 1)} className="size-11" />
            <p className="text-[13px] font-bold text-white/85">{current.name}님이 받을 수고 보상</p>
            <p className="text-[30px] leading-[1.32] font-bold tracking-[-0.8px] text-white">
              {reward.toLocaleString('ko-KR')}원
            </p>
            <p className="text-xs font-medium text-white/75">친구 {evaluatorCount}명의 가치 평가</p>
          </section>
          <button
            type="button"
            aria-label="다음"
            className="absolute right-0 flex size-11 items-center justify-center rounded-full bg-white text-lg"
            disabled={index >= members.length - 1}
            onClick={() => setIndex((prev) => Math.min(members.length - 1, prev + 1))}
          >
            ›
          </button>
        </div>

        <p className="text-ink-900 text-sm font-bold tracking-[-0.2px]">친구들의 한마디</p>
        <ul className="flex flex-col gap-2.5">
          {notes.map((note) => (
            <li
              key={note}
              className="border-line-hairline rounded-xl border bg-white px-4 py-3.5 text-sm leading-[1.5] font-medium text-[rgba(46,47,51,0.88)]"
            >
              “{note}”
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-surface-gray fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[430px] px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <Button variant="primary" fullWidth onClick={() => router.push(`/trips/${tripId}/settlement/board`)}>
          통합 정산표에 반영하기
        </Button>
      </div>
    </MobileShell>
  );
};
