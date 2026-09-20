'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Avatar } from '@/shared/components/avatar';
import { Button } from '@/shared/components/button';
import { MobileShell } from '@/shared/components/mobile-shell';
import { getErrorMessage } from '@/shared/lib/api';
import { isDemoInviteCode, normalizeInviteInput, useAppSession } from '@/shared/session';

import { INVITE_HIGHLIGHTS } from '../trip.constants';
import { useGroupSummaryQuery } from '../trip.hooks';
import { buildInvitePath, destinationToLabel, formatInviteDateBadge, resolveGuestResumePath } from '../trip.lib';

type GuestInviteLandingScreenProps = {
  code: string;
};

export const GuestInviteLandingScreen = ({ code }: GuestInviteLandingScreenProps) => {
  const router = useRouter();
  const session = useAppSession();
  const summaryQuery = useGroupSummaryQuery(code, !isDemoInviteCode(code));
  const trip =
    session.trips.find((item) => normalizeInviteInput(item.inviteCode) === normalizeInviteInput(code)) ?? null;
  const summary = summaryQuery.data;
  const host = trip?.members.find((member) => member.role.includes('호스트'));
  const hostName = summary?.inviterName ?? host?.name ?? '친구';
  const title = summary?.title ?? trip?.title ?? '우정여행';
  const destination = summary?.destination ? destinationToLabel(summary.destination) : (trip?.destination ?? '여행');
  const dateLabel = (() => {
    if (summary?.startDate && summary?.endDate) {
      return formatInviteDateBadge(summary.startDate, summary.endDate);
    }
    return trip ? `${trip.dateLabel} · ${trip.nightsLabel}` : '일정 미정';
  })();
  const memberCount = summary?.memberCount ?? trip?.memberCount ?? 4;

  useEffect(() => {
    if (!session.isGuest || !trip) {
      return;
    }
    router.replace(resolveGuestResumePath(code, trip));
  }, [code, router, session.isGuest, trip]);

  const handleJoin = () => {
    router.push(`${buildInvitePath(code)}/onboarding`);
  };

  return (
    <MobileShell className="bg-white">
      <div className="flex flex-1 flex-col items-center justify-center px-5">
        <div className="flex w-full max-w-[340px] flex-col items-center gap-4">
          <Avatar member={host?.member ?? 'doyeon'} size="md" className="size-10 text-base" />
          <h1 className="text-ink-900 text-center text-xl font-bold tracking-[-0.4px]">{hostName}님이 초대했어요 💌</h1>
          <p className="text-text-secondary-soft text-sm font-medium">함께 떠날 여행 준비를 도와주세요</p>
          {summaryQuery.isError ? (
            <p className="text-center text-sm font-medium text-[#e08300]">
              {getErrorMessage(summaryQuery.error, '초대 정보를 불러오지 못했어요. 링크를 다시 확인해 주세요.')}
            </p>
          ) : null}
          <div className="bg-surface-gray flex w-full flex-col items-center gap-2.5 rounded-[18px] p-[22px]">
            <p className="text-ink-900 text-[22px] font-bold tracking-[-0.4px]">
              {summaryQuery.isPending && !trip ? '초대 정보를 불러오는 중…' : title}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full bg-white px-3 py-2 text-xs font-medium text-[rgba(55,56,60,0.61)]">
                📍 {destination}
              </span>
              <span className="rounded-full bg-white px-3 py-2 text-xs font-medium text-[rgba(55,56,60,0.61)]">
                📅 {dateLabel}
              </span>
              <span className="rounded-full bg-white px-3 py-2 text-xs font-medium text-[rgba(55,56,60,0.61)]">
                👥 {memberCount}명
              </span>
            </div>
            <ul className="flex w-full flex-col gap-2.5 pt-1.5">
              {INVITE_HIGHLIGHTS.map((item) => (
                <li key={item.id} className="flex items-center gap-2.5">
                  <span className="flex size-[22px] items-center justify-center rounded-full bg-[rgba(0,191,64,0.1)] text-[11px] font-bold text-[#00bf40]">
                    ✓
                  </span>
                  <span className="text-ink-900 text-sm font-semibold">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <Button variant="primary" fullWidth onClick={handleJoin}>
          1분만에 여행 시작하러가기
        </Button>
        <p className="text-text-secondary-soft mt-3 text-center text-[13.5px] font-medium">
          앱 설치 · 회원가입 필요 없어요
        </p>
      </div>
    </MobileShell>
  );
};
