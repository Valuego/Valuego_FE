'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { isApiError } from '@/shared/lib/api';
import { normalizeInviteInput, useAppSession } from '@/shared/session';

import { useScheduleQuery } from '../trip.hooks';
import { buildInvitePath, buildTripHref } from '../trip.lib';
import { GuestMemberBadge, GuestUrlBar } from './guest-invite-chrome';

type GuestJoinCompleteScreenProps = {
  code: string;
};

export const GuestJoinCompleteScreen = ({ code }: GuestJoinCompleteScreenProps) => {
  const router = useRouter();
  const session = useAppSession();
  const trip =
    session.trips.find((item) => normalizeInviteInput(item.inviteCode) === normalizeInviteInput(code)) ?? null;
  const scheduleQuery = useScheduleQuery(trip?.id ?? '');
  const hasSchedule = Boolean(scheduleQuery.data?.days?.length);
  const scheduleMissing = isApiError(scheduleQuery.error) && scheduleQuery.error.errorData?.code === 'TRAVEL-001';
  const canViewSchedule = hasSchedule && !scheduleMissing;

  useEffect(() => {
    if (session.isGuest && trip) {
      return;
    }
    if (!session.isGuest) {
      router.replace(`${buildInvitePath(code)}/profile`);
    }
  }, [code, router, session.isGuest, trip]);

  const handleViewSchedule = () => {
    if (!trip || !canViewSchedule) {
      return;
    }
    router.push(buildTripHref(trip.id, 'schedule'));
  };

  return (
    <MobileShell className="bg-white">
      <GuestUrlBar groupLink={code} />
      <div className="border-line-hairline flex h-16 items-center justify-between border-b px-5">
        <Header title="뒤로가기" onBack={() => router.push(`${buildInvitePath(code)}/profile`)} />
        {trip ? <GuestMemberBadge members={trip.members} memberCount={trip.memberCount} /> : <span />}
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="flex size-[76px] items-center justify-center rounded-full bg-[rgba(0,191,64,0.13)]">
          <span className="text-[40px] font-extrabold text-[#00bf40]" aria-hidden>
            ✓
          </span>
        </div>
        <h1 className="text-ink-900 text-[22px] font-bold tracking-[-0.4px]">참여 완료!</h1>
        <p className="text-text-secondary-soft text-sm leading-[22px] font-medium">
          호스트가 일정을 생성하면 버튼 클릭이 활성화되요.
          <br />
          경유지마다 이모지 투표와 의견을 남길 수 있어요.
        </p>
      </div>
      <div className="px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <Button variant="primary" fullWidth disabled={!canViewSchedule} onClick={handleViewSchedule}>
          일정 구경하기
        </Button>
      </div>
    </MobileShell>
  );
};
