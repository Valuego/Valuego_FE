'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import { Avatar } from '@/shared/components/avatar';
import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { confirmSettlementBoard } from '@/shared/session';

import { rememberActiveTrip, useTripView } from '../trip.hooks';
import { laborRewardFor } from '../trip.lib';

type SettlementBoardScreenProps = {
  tripId: string;
};

export const SettlementBoardScreen = ({ tripId }: SettlementBoardScreenProps) => {
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

  const total = useMemo(() => trip?.expenses.reduce((acc, item) => acc + item.amount, 0) ?? 0, [trip]);
  const perPerson = trip && trip.members.length > 0 ? Math.round(total / trip.members.length) : 0;

  const memberRows = useMemo(() => {
    if (!trip) {
      return [];
    }
    return trip.members.map((member) => {
      const reward = laborRewardFor(trip, member.id);
      const net = reward - perPerson;
      return { member, reward, net };
    });
  }, [perPerson, trip]);

  if (isLoading || !trip) {
    return (
      <MobileShell className="bg-surface-gray">
        <div className="flex flex-1 items-center justify-center text-sm text-[rgba(55,56,60,0.61)]">
          정산표를 불러오는 중…
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-3 pb-40">
        <Header title="통합 정산표" onBack={() => router.push(`/trips/${tripId}/settlement/result`)} />

        <div className="flex gap-3">
          <div
            className="flex flex-1 flex-col items-center gap-1.5 rounded-[20px] px-4 py-5"
            style={{ backgroundImage: 'linear-gradient(90deg, #3366ff 0%, #6541f2 100%)' }}
          >
            <p className="text-[12.5px] font-bold text-white/88">총 지출</p>
            <p className="text-[22px] font-extrabold tracking-[-0.5px] text-white">
              {(total || 100000).toLocaleString('ko-KR')}원
            </p>
          </div>
          <div
            className="flex flex-1 flex-col items-center gap-1.5 rounded-[20px] px-4 py-5"
            style={{ backgroundImage: 'linear-gradient(90deg, #ff9200 0%, #ff6b42 100%)' }}
          >
            <p className="text-[12.5px] font-bold text-white/88">1인당</p>
            <p className="text-[22px] font-extrabold tracking-[-0.5px] text-white">
              {(perPerson || 25000).toLocaleString('ko-KR')}원
            </p>
          </div>
        </div>

        <p className="text-ink-900 text-sm font-bold tracking-[-0.2px]">멤버별 수고 보상</p>
        <ul className="flex flex-col gap-3.5">
          {trip.laborCategories.map((category) => {
            const member = trip.members.find((item) => item.id === category.assigneeId);
            if (!member) {
              return null;
            }
            return (
              <li
                key={category.id}
                className="border-line-hairline flex items-center justify-between rounded-[14px] border bg-white py-2.5 pr-3 pl-3.5"
              >
                <Avatar member={member.member} size="sm" initial={member.name.slice(0, 1)} className="size-10" />
                <p className="text-ink-900 min-w-0 flex-1 px-3 text-sm font-bold">
                  {member.name}의 {category.title}
                </p>
                <p className="text-ink-900 text-sm font-bold">
                  {laborRewardFor(trip, member.id).toLocaleString('ko-KR')}원
                </p>
              </li>
            );
          })}
        </ul>

        <div>
          <p className="text-ink-900 text-sm font-bold tracking-[-0.2px]">멤버별 정산</p>
          <p className="text-text-secondary-soft mt-2 text-[13.5px] font-medium">
            결제 금액 + 수고 가치를 합산한 가격이에요
          </p>
        </div>
        <ul className="flex flex-col gap-3.5">
          {memberRows.map(({ member, net }) => {
            const receives = net >= 0;
            return (
              <li
                key={member.id}
                className="border-line-hairline flex items-center gap-3 rounded-[14px] border bg-white px-4 py-3.5"
              >
                <Avatar member={member.member} size="sm" initial={member.name.slice(0, 1)} className="size-10" />
                <div className="min-w-0 flex-1">
                  <p className="text-ink-900 text-[15px] font-bold tracking-[-0.2px]">{member.name}</p>
                  <p className="text-text-secondary-soft text-[12.5px] font-medium">
                    {receives ? '받을 금액' : '보낼 금액'}
                  </p>
                </div>
                <p className={`text-sm font-bold tracking-[-0.2px] ${receives ? 'text-brand-blue' : 'text-[#ff4242]'}`}>
                  {receives ? '받아요' : '보내요'} {Math.abs(net || (receives ? 45000 : 41500)).toLocaleString('ko-KR')}
                  원
                </p>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="bg-surface-gray fixed right-0 bottom-0 left-0 mx-auto flex w-full max-w-[430px] flex-col gap-2 px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <Button
          variant="outline"
          fullWidth
          className="border-brand-blue text-brand-blue border-[1.5px]"
          onClick={() => confirmSettlementBoard(tripId)}
        >
          {trip.settlementConfirmed ? '확인 완료' : '확인하기 (1/4)'}
        </Button>
        <Button
          variant="primary"
          fullWidth
          disabled={!trip.settlementConfirmed}
          onClick={() => router.push(`/trips/${tripId}/settlement/recap`)}
        >
          리캡 카드 보기
        </Button>
      </div>
    </MobileShell>
  );
};
