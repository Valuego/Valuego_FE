'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Avatar } from '@/shared/components/avatar';
import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { StatusPill } from '@/shared/components/status-pill';
import { getErrorMessage } from '@/shared/lib/api';

import { rememberActiveTrip, useTripView } from '../trip.hooks';

type SettlementStartScreenProps = {
  tripId: string;
};

export const SettlementStartScreen = ({ tripId }: SettlementStartScreenProps) => {
  const router = useRouter();
  const { trip, isLoading, isError, error } = useTripView(tripId);
  const submittedCount = trip?.laborValues.length ?? 0;
  const memberCount = trip?.members.length ?? 0;
  const progress = memberCount > 0 ? Math.min(100, Math.round((submittedCount / memberCount) * 100)) : 0;

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

  if (isLoading) {
    return (
      <MobileShell className="bg-white">
        <div className="flex flex-1 items-center justify-center text-sm text-[rgba(55,56,60,0.61)]">
          정산을 준비하는 중…
        </div>
      </MobileShell>
    );
  }

  if (!trip) {
    return (
      <MobileShell className="bg-white">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 text-center">
          <p className="text-sm font-medium text-[#e08300]">
            {isError ? getErrorMessage(error) : '여행을 찾을 수 없어요.'}
          </p>
          <Button variant="outline" onClick={() => router.push('/home')}>
            홈으로
          </Button>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell className="bg-white">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-3 pb-28">
        <Header title="정산" onBack={() => router.push(`/trips/${tripId}`)} />
        <div className="flex flex-col gap-1.5">
          <h2 className="text-ink-900 text-[22px] font-bold tracking-[-0.5px]">돈 정산 전에, 수고를 먼저 나눠요</h2>
          <p className="text-text-secondary-soft text-[13.5px] leading-[1.5] font-medium">
            운전·계획처럼 안 보이는 수고도 서로 인정해요.
            <br />
            회고는 블라인드로 반영돼요.
          </p>
        </div>

        <section
          className="flex flex-col gap-2.5 rounded-2xl border border-[rgba(112,115,132,0.16)] px-4 py-3.5"
          style={{ backgroundImage: 'linear-gradient(160deg, #f0f2ff 0%, #f5f1ff 71%)' }}
        >
          <div className="flex items-center justify-between">
            <p className="text-ink-900 text-sm font-bold">📨 수고 회고 발송됨</p>
            <p className="text-brand-purple text-[13px] font-bold">
              {submittedCount}/{memberCount} 완료
            </p>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(112,115,132,0.12)]">
            <div className="bg-brand-purple h-full rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </section>

        <ul className="border-line-hairline overflow-hidden rounded-2xl border bg-white">
          {trip.members.map((member, index) => {
            const done = trip.laborValues.some((item) => item.memberId === member.id);
            return (
              <li
                key={member.id}
                className={`flex items-center gap-3 px-3.5 py-3 ${index === 0 ? '' : 'border-line-hairline border-t'}`}
              >
                <Avatar
                  member={member.member}
                  size="sm"
                  initial={member.name.slice(0, 1)}
                  className="size-[34px] text-sm"
                />
                <p className="text-ink-900 min-w-0 flex-1 text-sm font-bold">{member.name}</p>
                {done ? <StatusPill label="완료" tone="done" /> : <StatusPill label="작성 중" tone="warning" />}
              </li>
            );
          })}
        </ul>

        <p className="rounded-xl bg-[rgba(0,191,64,0.05)] px-3.5 py-3 text-[12.5px] font-medium text-[rgba(55,56,60,0.61)]">
          🔒 누가 누구를 얼마로 인정했는지는 공개되지 않아요
        </p>
      </div>
      <div className="fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[430px] bg-white px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <Button variant="primary" fullWidth onClick={() => router.push(`/trips/${tripId}/settlement/labor`)}>
          수고 가치 기록하기
        </Button>
      </div>
    </MobileShell>
  );
};
