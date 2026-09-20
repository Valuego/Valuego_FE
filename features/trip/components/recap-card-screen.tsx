'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { InfoBanner } from '@/shared/components/info-banner';
import { MobileShell } from '@/shared/components/mobile-shell';

import { useSettlementRecapQuery, useTripView } from '../trip.hooks';
import { buildInvitePath, buildInviteUrl, parseGroupId } from '../trip.lib';

type RecapCardScreenProps = {
  tripId: string;
};

export const RecapCardScreen = ({ tripId }: RecapCardScreenProps) => {
  const router = useRouter();
  const groupId = parseGroupId(tripId) ?? 0;
  const { trip, isLoading } = useTripView(tripId);
  const recapQuery = useSettlementRecapQuery(groupId);
  const [copied, setCopied] = useState(false);

  const invitePath = trip ? buildInvitePath(trip.inviteCode) : '/join';
  const inviteUrl =
    trip && typeof window !== 'undefined' ? buildInviteUrl(window.location.origin, trip.inviteCode) : invitePath;

  if (isLoading || recapQuery.isPending || !trip) {
    return (
      <MobileShell className="bg-white">
        <div className="flex flex-1 items-center justify-center text-sm text-[rgba(55,56,60,0.61)]">
          리캡 카드를 불러오는 중…
        </div>
      </MobileShell>
    );
  }

  const recap = recapQuery.data;

  const handleCopy = async () => {
    if (!inviteUrl) {
      return;
    }
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const rows = [
    { label: '총 이동', value: recap?.totalDistance ?? '-' },
    { label: '총 지출', value: `${(recap?.totalExpenseAmount ?? 0).toLocaleString('ko-KR')}원` },
    { label: '미니게임', value: recap?.gameResult ?? '-' },
    { label: '인정한 수고 가치', value: `${(recap?.totalEffortAmount ?? 0).toLocaleString('ko-KR')}원` },
  ] as const;

  return (
    <MobileShell className="bg-white">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-3 pb-8">
        <Header title="리캡 카드" onBack={() => router.push(`/trips/${tripId}/settlement/board`)} />

        <section
          className="flex flex-col gap-3.5 rounded-[22px] p-[22px]"
          style={{ backgroundImage: 'linear-gradient(128deg, #2f2f2f 0%, #5b3dbe 43%, #7a4fe0 71%)' }}
        >
          <p className="text-[11.5px] font-bold tracking-[1px] text-[#c9bcff]">가치가자 RECAP</p>
          <h2 className="text-[24px] font-extrabold tracking-[-0.5px] text-white">{recap?.groupTitle ?? trip.title}</h2>
          <p className="text-[13px] font-medium text-white/75">
            {recap?.groupPeriod ?? trip.dateLabel} · {recap?.durationText ?? trip.nightsLabel} ·{' '}
            {recap?.memberCount ?? trip.memberCount}명
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

        <div className="border-line-hairline flex items-center justify-between rounded-[10px] border bg-white py-[11px] pr-2.5 pl-3">
          <p className="text-text-secondary-soft mr-3 truncate text-[13px] font-medium">{inviteUrl}</p>
          <button
            type="button"
            className="text-brand-blue shrink-0 rounded-lg bg-[rgba(51,102,255,0.08)] px-3 py-[7px] text-[12.5px] font-bold"
            onClick={() => void handleCopy()}
          >
            URL 복사
          </button>
        </div>

        {copied ? (
          <div className="mx-auto rounded-xl bg-[rgba(23,23,25,0.92)] px-4 py-3 text-[13.5px] text-white">
            <span className="font-bold">✓</span> 링크를 복사했어요
          </div>
        ) : null}

        <div className="mt-auto">
          <Button variant="primary" fullWidth onClick={() => router.push('/home')}>
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </MobileShell>
  );
};
