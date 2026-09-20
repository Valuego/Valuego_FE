'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { InfoBanner } from '@/shared/components/info-banner';
import { MobileShell } from '@/shared/components/mobile-shell';
import { getErrorMessage } from '@/shared/lib/api';

import { useSettlementQuery, useSettlementRecapQuery, useTripView } from '../trip.hooks';
import { buildInviteUrl, formatInviteLinkLabel, parseGroupId } from '../trip.lib';

type RecapCardScreenProps = {
  tripId: string;
};

const GAME_TYPE_LABEL: Record<string, string> = {
  ROULETTE: '룰렛',
  LADDER: '사다리',
  QUIZ: '퀴즈',
};

const formatGameResult = (raw?: string | null) => {
  if (!raw) {
    return '-';
  }
  return raw.replace(/ROULETTE|LADDER|QUIZ/g, (token) => GAME_TYPE_LABEL[token] ?? token);
};

export const RecapCardScreen = ({ tripId }: RecapCardScreenProps) => {
  const router = useRouter();
  const groupId = parseGroupId(tripId) ?? 0;
  const { trip, isLoading } = useTripView(tripId);
  const recapQuery = useSettlementRecapQuery(groupId);
  const settlementQuery = useSettlementQuery(groupId);
  const [copied, setCopied] = useState(false);

  const inviteUrl =
    trip && typeof window !== 'undefined' ? buildInviteUrl(window.location.origin, trip.inviteCode) : '';
  const inviteLabel =
    trip && typeof window !== 'undefined' ? formatInviteLinkLabel(trip.inviteCode, window.location.origin) : '';

  if (isLoading || !trip) {
    return (
      <MobileShell className="bg-white">
        <div className="flex flex-1 items-center justify-center text-sm text-[rgba(55,56,60,0.61)]">
          리캡 카드를 불러오는 중…
        </div>
      </MobileShell>
    );
  }

  const recap = recapQuery.data;
  const totalExpense = recap?.totalExpenseAmount ?? settlementQuery.data?.totalExpense ?? 0;

  const handleCopy = async () => {
    if (!inviteUrl) {
      return;
    }
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const handleClose = () => {
    router.push('/home');
  };

  const rows = [
    { label: '총 이동', value: recap?.totalDistance || '-' },
    { label: '총 지출', value: `${totalExpense.toLocaleString('ko-KR')}원` },
    { label: '미니게임', value: formatGameResult(recap?.gameResult) },
    {
      label: '인정한 수고 가치',
      value: `${(recap?.totalEffortAmount ?? 0).toLocaleString('ko-KR')}원`,
    },
  ] as const;

  return (
    <MobileShell className="relative bg-white">
      <div className="flex flex-1 flex-col px-5 pt-3 pb-[calc(140px+env(safe-area-inset-bottom))]">
        <Header title="리캡 카드" onBack={() => router.push(`/trips/${tripId}/settlement/board`)} />

        <div className="mt-4 flex flex-col gap-4">
          <section
            className="flex flex-col gap-3.5 rounded-[22px] p-[22px]"
            style={{ backgroundImage: 'linear-gradient(128deg, #2f2f2f 0%, #5b3dbe 43%, #7a4fe0 71%)' }}
          >
            <p className="text-[11.5px] font-bold tracking-[1px] text-[#c9bcff]">가치가자 RECAP</p>
            <h2 className="text-[24px] font-extrabold tracking-[-0.5px] text-white">
              {recap?.groupTitle || trip.title}
            </h2>
            <p className="text-[13px] font-medium text-white/75">
              {recap?.groupPeriod || trip.dateLabel} · {recap?.durationText || trip.nightsLabel} ·{' '}
              {recap?.memberCount || trip.memberCount}명
            </p>
            <div className="overflow-hidden rounded-[14px] bg-white/8">
              {rows.map((row, index) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between px-3.5 py-3 ${index === 0 ? '' : 'border-t border-white/10'}`}
                >
                  <p className="text-[13px] font-medium text-white/75">{row.label}</p>
                  <p className="text-[13.5px] font-bold text-white">{row.value}</p>
                </div>
              ))}
            </div>
          </section>

          <InfoBanner accent="purple" message="리캡카드를 공유하여 친구들과 추억을 공유해요." />

          {recapQuery.isError ? (
            <p className="text-sm font-medium text-[#e08300]">
              {getErrorMessage(recapQuery.error, '리캡 일부 정보를 불러오지 못했어요.')}
            </p>
          ) : null}
        </div>
      </div>

      {copied ? (
        <div className="pointer-events-none absolute bottom-[148px] left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-[rgba(23,23,25,0.92)] px-4 py-[13px] text-[13.5px] text-white shadow-[0px_8px_14px_rgba(23,23,26,0.3)]">
          <span className="font-bold">✓</span>
          <span className="font-medium">링크를 복사했어요</span>
        </div>
      ) : null}

      <div className="fixed right-0 bottom-0 left-0 z-20 mx-auto flex w-full max-w-[430px] flex-col gap-3.5 bg-white px-5 pt-3 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <div className="border-line-hairline flex items-center justify-between rounded-[10px] border bg-white py-[11px] pr-2.5 pl-3">
          <p className="text-text-secondary-soft mr-3 truncate text-[13px] font-medium">{inviteLabel || inviteUrl}</p>
          <button
            type="button"
            className="text-brand-blue shrink-0 rounded-lg bg-[rgba(51,102,255,0.08)] px-3 py-[7px] text-[12.5px] font-bold"
            onClick={() => void handleCopy()}
          >
            URL 복사
          </button>
        </div>
        <Button variant="primary" fullWidth className="h-[54px] text-base" onClick={handleClose}>
          닫기
        </Button>
      </div>
    </MobileShell>
  );
};
