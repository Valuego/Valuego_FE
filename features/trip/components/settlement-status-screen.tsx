'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Avatar } from '@/shared/components/avatar';
import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { StatusPill } from '@/shared/components/status-pill';

import { rememberActiveTrip, useTripView } from '../trip.hooks';

type SettlementStatusScreenProps = {
  tripId: string;
};

export const SettlementStatusScreen = ({ tripId }: SettlementStatusScreenProps) => {
  const router = useRouter();
  const { trip, isLoading } = useTripView(tripId);
  const submittedCount = trip?.laborValues.length ?? 0;
  const memberCount = trip?.members.length ?? 0;
  const progress = memberCount > 0 ? Math.min(100, Math.round((submittedCount / memberCount) * 100)) : 0;

  useEffect(() => {
    rememberActiveTrip(tripId);
  }, [tripId]);

  useEffect(() => {
    if (!isLoading && !trip) {
      router.replace('/home');
    }
  }, [isLoading, router, trip]);

  if (isLoading || !trip) {
    return (
      <MobileShell className="bg-white">
        <div className="flex flex-1 items-center justify-center text-sm text-[rgba(55,56,60,0.61)]">
          진행상태를 불러오는 중…
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell className="bg-white">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-3 pb-28">
        <Header title="정산" onBack={() => router.push(`/trips/${tripId}/settlement/values`)} />
        <div className="flex flex-col gap-1.5">
          <h2 className="text-ink-900 text-[22px] font-bold tracking-[-0.5px]">친구들의 수고 회고가 모이고 있어요</h2>
          <p className="text-text-secondary-soft text-[13.5px] leading-[1.5] font-medium">
            제출이 끝나면 수고 결과와 통합 정산표를 볼 수 있어요.
          </p>
        </div>

        <section
          className="flex flex-col gap-2.5 rounded-2xl border border-[rgba(112,115,132,0.16)] px-4 py-3.5"
          style={{ backgroundImage: 'linear-gradient(160deg, #f0f2ff 0%, #f5f1ff 71%)' }}
        >
          <div className="flex items-center justify-between">
            <p className="text-ink-900 text-sm font-bold">📨 수고 회고 집계 중</p>
            <p className="text-brand-purple text-[13px] font-bold">
              {submittedCount}/{memberCount} 완료
            </p>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(112,115,132,0.12)]">
            <div className="bg-brand-purple h-full rounded-full" style={{ width: `${Math.max(progress, 12)}%` }} />
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
      </div>
      <div className="fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[430px] bg-white px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <Button variant="primary" fullWidth onClick={() => router.push(`/trips/${tripId}/settlement/result`)}>
          수고 결과 보기
        </Button>
      </div>
    </MobileShell>
  );
};
