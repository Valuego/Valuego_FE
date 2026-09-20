'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Avatar } from '@/shared/components/avatar';
import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { getErrorMessage } from '@/shared/lib/api';
import { upsertLocalTrip } from '@/shared/session';

import { useConfirmSettlement, useSettlementQuery, useTripView } from '../trip.hooks';
import { parseGroupId } from '../trip.lib';

type SettlementBoardScreenProps = {
  tripId: string;
};

export const SettlementBoardScreen = ({ tripId }: SettlementBoardScreenProps) => {
  const router = useRouter();
  const groupId = parseGroupId(tripId) ?? 0;
  const { trip, isLoading: tripLoading } = useTripView(tripId);
  const settlementQuery = useSettlementQuery(groupId);
  const confirmSettlement = useConfirmSettlement(groupId);

  useEffect(() => {
    if (!tripLoading && !trip) {
      router.replace('/home');
    }
  }, [router, trip, tripLoading]);

  if (tripLoading || settlementQuery.isPending || !trip) {
    return (
      <MobileShell className="bg-surface-gray">
        <div className="flex flex-1 items-center justify-center text-sm text-[rgba(55,56,60,0.61)]">
          정산표를 불러오는 중…
        </div>
      </MobileShell>
    );
  }

  const settlement = settlementQuery.data;
  const hasConfirmed = Boolean(settlement?.isConfirmed || trip.settlementConfirmed || confirmSettlement.isSuccess);
  const findMember = (memberId: number) => trip.members.find((member) => Number(member.id) === memberId);

  const handleConfirm = async () => {
    try {
      await confirmSettlement.mutateAsync();
      upsertLocalTrip({ ...trip, settlementConfirmed: true });
    } catch {
      // mutation error is rendered below
    }
  };

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
              {(settlement?.totalExpense ?? 0).toLocaleString('ko-KR')}원
            </p>
          </div>
          <div
            className="flex flex-1 flex-col items-center gap-1.5 rounded-[20px] px-4 py-5"
            style={{ backgroundImage: 'linear-gradient(90deg, #ff9200 0%, #ff6b42 100%)' }}
          >
            <p className="text-[12.5px] font-bold text-white/88">1인당</p>
            <p className="text-[22px] font-extrabold tracking-[-0.5px] text-white">
              {(settlement?.expensePerMember ?? 0).toLocaleString('ko-KR')}원
            </p>
          </div>
        </div>

        <p className="text-ink-900 text-sm font-bold tracking-[-0.2px]">멤버별 수고 보상</p>
        <ul className="flex flex-col gap-3.5">
          {(settlement?.effortRewards ?? []).map((reward) => {
            const member = findMember(reward.groupMemberId);
            return (
              <li
                key={reward.groupMemberId}
                className="border-line-hairline flex items-center justify-between rounded-[14px] border bg-white py-2.5 pr-3 pl-3.5"
              >
                {member ? (
                  <Avatar
                    member={member.member}
                    size="sm"
                    initial={reward.memberName.slice(0, 1)}
                    className="size-10"
                  />
                ) : null}
                <p className="text-ink-900 min-w-0 flex-1 px-3 text-sm font-bold">{reward.effortTitle}</p>
                <p className="text-ink-900 text-sm font-bold">{reward.rewardAmount.toLocaleString('ko-KR')}원</p>
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
          {(settlement?.memberSettlements ?? []).map((row) => {
            const member = findMember(row.groupMemberId);
            const receives = row.settlementType === 'GIVE';
            return (
              <li
                key={row.groupMemberId}
                className="border-line-hairline flex items-center gap-3 rounded-[14px] border bg-white px-4 py-3.5"
              >
                {member ? (
                  <Avatar member={member.member} size="sm" initial={row.memberName.slice(0, 1)} className="size-10" />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="text-ink-900 text-[15px] font-bold tracking-[-0.2px]">{row.memberName}</p>
                  <p className="text-text-secondary-soft text-[12.5px] font-medium">
                    {row.settlementType === 'ZERO' ? '정산 없음' : receives ? '받을 금액' : '보낼 금액'}
                  </p>
                </div>
                {row.settlementType === 'ZERO' ? (
                  <p className="text-text-secondary-soft text-sm font-bold tracking-[-0.2px]">0원</p>
                ) : (
                  <p
                    className={`text-sm font-bold tracking-[-0.2px] ${receives ? 'text-brand-blue' : 'text-[#ff4242]'}`}
                  >
                    {receives ? '받아요' : '보내요'} {row.amount.toLocaleString('ko-KR')}원
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        {confirmSettlement.isError ? (
          <p className="text-sm font-medium text-[#e08300]">{getErrorMessage(confirmSettlement.error)}</p>
        ) : null}
      </div>

      <div className="bg-surface-gray fixed right-0 bottom-0 left-0 mx-auto flex w-full max-w-[430px] flex-col gap-2 px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <Button
          variant="outline"
          fullWidth
          className="border-brand-blue text-brand-blue border-[1.5px]"
          disabled={confirmSettlement.isPending || hasConfirmed}
          onClick={() => void handleConfirm()}
        >
          {hasConfirmed ? '확인 완료' : confirmSettlement.isPending ? '확인하는 중…' : '확인하기'}
        </Button>
        <Button
          variant="primary"
          fullWidth
          disabled={!hasConfirmed}
          onClick={() => router.push(`/trips/${tripId}/settlement/recap`)}
        >
          리캡 카드 보기
        </Button>
      </div>
    </MobileShell>
  );
};
