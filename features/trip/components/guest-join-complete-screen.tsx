'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { normalizeInviteInput, useAppSession } from '@/shared/session';

import { useScheduleQuery, useTripView } from '../trip.hooks';
import { buildInvitePath, buildTripHref, isScheduleNotFound } from '../trip.lib';
import { GuestMemberBadge } from './guest-invite-chrome';

type GuestJoinCompleteScreenProps = {
  code: string;
};

export const GuestJoinCompleteScreen = ({ code }: GuestJoinCompleteScreenProps) => {
  const router = useRouter();
  const session = useAppSession();
  const sessionTrip =
    session.trips.find((item) => normalizeInviteInput(item.inviteCode) === normalizeInviteInput(code)) ?? null;
  const { trip, isLoading } = useTripView(sessionTrip?.id ?? '', { refetchInterval: 4000 });
  const resolvedTrip = trip ?? sessionTrip;
  const scheduleQuery = useScheduleQuery(resolvedTrip?.id ?? '', {
    refetchInterval: 4000,
    enabled: Boolean(resolvedTrip),
  });
  const hasSchedule = Boolean(scheduleQuery.data?.days?.length);
  const scheduleMissing = isScheduleNotFound(scheduleQuery.error);
  const isOngoing = resolvedTrip?.phase === 'ongoing' || resolvedTrip?.phase === 'settling';
  const canEnterTrip =
    Boolean(resolvedTrip) && (isOngoing || (hasSchedule && !scheduleQuery.isPending && !scheduleMissing));

  useEffect(() => {
    if (isLoading || resolvedTrip) {
      return;
    }
    router.replace(`${buildInvitePath(code)}/profile`);
  }, [code, isLoading, resolvedTrip, router]);

  const handleEnterTrip = () => {
    if (!resolvedTrip || !canEnterTrip) {
      return;
    }
    router.push(isOngoing ? buildTripHref(resolvedTrip.id) : buildTripHref(resolvedTrip.id, 'schedule'));
  };

  return (
    <MobileShell className="bg-white">
      <div className="border-line-hairline flex h-16 items-center justify-between border-b px-5">
        <Header title="뒤로가기" onBack={() => router.push(`${buildInvitePath(code)}/style`)} />
        {resolvedTrip ? (
          <GuestMemberBadge members={resolvedTrip.members} memberCount={resolvedTrip.memberCount} />
        ) : (
          <span />
        )}
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="flex size-[76px] items-center justify-center rounded-full bg-[rgba(0,191,64,0.13)]">
          <span className="text-[40px] font-extrabold text-[#00bf40]" aria-hidden>
            ✓
          </span>
        </div>
        <h1 className="text-ink-900 text-[22px] font-bold tracking-[-0.4px]">참여 완료!</h1>
        <p className="text-text-secondary-soft text-sm leading-[22px] font-medium whitespace-pre-line">
          {canEnterTrip
            ? isOngoing
              ? '여행이 시작됐어요. 일행과 함께 일정을 구경할 수 있어요.'
              : '호스트가 일정을 만들었어요. 경유지마다 투표와 의견을 남길 수 있어요.'
            : '호스트가 일정을 생성하면 버튼이 활성화돼요.\n경유지마다 이모지 투표와 의견을 남길 수 있어요.'}
        </p>
      </div>
      <div className="px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <Button variant="primary" fullWidth disabled={!canEnterTrip} onClick={handleEnterTrip}>
          {isOngoing ? '여행 중 홈으로' : '일정 구경하기'}
        </Button>
      </div>
    </MobileShell>
  );
};
