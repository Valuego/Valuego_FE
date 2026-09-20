'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';

import { rememberActiveTrip, useTripView } from '../trip.hooks';

type SettlementStatusScreenProps = {
  tripId: string;
};

export const SettlementStatusScreen = ({ tripId }: SettlementStatusScreenProps) => {
  const router = useRouter();
  const { trip, isLoading } = useTripView(tripId);

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
          <h2 className="text-ink-900 text-[22px] font-bold tracking-[-0.5px]">수고 회고를 제출했어요</h2>
          <p className="text-text-secondary-soft text-[13.5px] leading-[1.5] font-medium">
            친구들이 모두 제출을 마치면 정확한 결과를 볼 수 있어요.
            <br />
            지금 바로 중간 결과를 확인할 수도 있어요.
          </p>
        </div>

        <section
          className="flex flex-col gap-2 rounded-2xl border border-[rgba(112,115,132,0.16)] px-4 py-3.5"
          style={{ backgroundImage: 'linear-gradient(160deg, #f0f2ff 0%, #f5f1ff 71%)' }}
        >
          <p className="text-ink-900 text-sm font-bold">📨 수고 회고 집계 중</p>
          <p className="text-text-secondary-soft text-[12.5px] font-medium">
            🔒 누가 얼마를 냈는지는 공개되지 않고, 중앙값만 반영돼요
          </p>
        </section>
      </div>
      <div className="fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[430px] bg-white px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <Button variant="primary" fullWidth onClick={() => router.push(`/trips/${tripId}/settlement/result`)}>
          수고 결과 보기
        </Button>
      </div>
    </MobileShell>
  );
};
