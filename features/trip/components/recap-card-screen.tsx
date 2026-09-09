'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { InfoBanner } from '@/shared/components/info-banner';
import { MobileShell } from '@/shared/components/mobile-shell';
import { advanceTripPhase } from '@/shared/session';

import { rememberActiveTrip, useScheduleQuery, useTripView } from '../trip.hooks';
import { buildInviteUrl, laborRewardFor } from '../trip.lib';

type RecapCardScreenProps = {
  tripId: string;
};

export const RecapCardScreen = ({ tripId }: RecapCardScreenProps) => {
  const router = useRouter();
  const { trip, isLoading } = useTripView(tripId);
  const scheduleQuery = useScheduleQuery(tripId);
  const [copied, setCopied] = useState(false);

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

  const totalSpent = useMemo(() => trip?.expenses.reduce((acc, item) => acc + item.amount, 0) ?? 0, [trip]);
  const laborTotal = useMemo(
    () => trip?.members.reduce((acc, member) => acc + laborRewardFor(trip, member.id), 0) ?? 0,
    [trip],
  );
  const distance = scheduleQuery.data?.days.reduce((acc, day) => acc + (day.totalDistanceKm ?? 0), 0) ?? 0;
  const inviteUrl =
    trip && typeof window !== 'undefined' ? buildInviteUrl(window.location.origin, trip.inviteCode) : trip?.inviteCode;

  if (isLoading || !trip) {
    return (
      <MobileShell className="bg-white">
        <div className="flex flex-1 items-center justify-center text-sm text-[rgba(55,56,60,0.61)]">
          리캡 카드를 불러오는 중…
        </div>
      </MobileShell>
    );
  }

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

  const handleHome = () => {
    advanceTripPhase(tripId, 'settled');
    router.push('/home');
  };

  const rows = [
    { label: '총 이동', value: `${distance > 0 ? Math.round(distance) : 340}km` },
    { label: '총 지출', value: `${(totalSpent || 100000).toLocaleString('ko-KR')}원` },
    { label: '미니게임', value: `룰렛·사다리 ${Math.max(trip.timeline.length, 1)}판` },
    { label: '인정한 수고 가치', value: `${(laborTotal || 72000).toLocaleString('ko-KR')}원` },
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
          <h2 className="text-[24px] font-extrabold tracking-[-0.5px] text-white">{trip.title}</h2>
          <p className="text-[13px] font-medium text-white/75">
            {trip.dateLabel} · {trip.nightsLabel} · {trip.memberCount}명
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
          <Button variant="primary" fullWidth onClick={handleHome}>
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </MobileShell>
  );
};
