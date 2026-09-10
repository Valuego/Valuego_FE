'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Avatar } from '@/shared/components/avatar';
import { Button } from '@/shared/components/button';
import { MobileShell } from '@/shared/components/mobile-shell';
import { acceptInviteFromLink, normalizeInviteInput, useAppSession } from '@/shared/session';

import { INVITE_HIGHLIGHTS } from '../trip.constants';
import { buildInvitePath } from '../trip.lib';
import { GuestUrlBar } from './guest-invite-chrome';

type GuestInviteLandingScreenProps = {
  code: string;
};

const openedInviteKey = (code: string) => `valuego.invite.opened.${normalizeInviteInput(code)}`;

export const GuestInviteLandingScreen = ({ code }: GuestInviteLandingScreenProps) => {
  const router = useRouter();
  const session = useAppSession();
  const trip =
    session.trips.find((item) => normalizeInviteInput(item.inviteCode) === normalizeInviteInput(code)) ?? null;
  const host = trip?.members.find((member) => member.role.includes('호스트'));
  const hostName = host?.name ?? '친구';

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const key = openedInviteKey(code);
    if (window.sessionStorage.getItem(key)) {
      return;
    }
    window.sessionStorage.setItem(key, '1');
    acceptInviteFromLink(code);
  }, [code]);

  const handleJoin = () => {
    router.push(`${buildInvitePath(code)}/onboarding`);
  };

  return (
    <MobileShell className="bg-white">
      <GuestUrlBar groupLink={code} />
      <div className="flex flex-1 flex-col items-center justify-center px-5">
        <div className="flex w-full max-w-[340px] flex-col items-center gap-4">
          <Avatar member={host?.member ?? 'doyeon'} size="md" className="size-10 text-base" />
          <h1 className="text-ink-900 text-center text-xl font-bold tracking-[-0.4px]">
            {trip ? `${hostName}님이 초대했어요 💌` : '친구가 초대했어요 💌'}
          </h1>
          <p className="text-text-secondary-soft text-sm font-medium">함께 떠날 여행 준비를 도와주세요</p>
          <div className="bg-surface-gray flex w-full flex-col items-center gap-2.5 rounded-[18px] p-[22px]">
            <p className="text-ink-900 text-[22px] font-bold tracking-[-0.4px]">{trip?.title ?? '우정여행'}</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full bg-white px-3 py-2 text-xs font-medium text-[rgba(55,56,60,0.61)]">
                📍 {trip?.destination ?? '여행'}
              </span>
              <span className="rounded-full bg-white px-3 py-2 text-xs font-medium text-[rgba(55,56,60,0.61)]">
                📅 {trip ? `${trip.dateLabel} · ${trip.nightsLabel}` : '일정 미정'}
              </span>
              <span className="rounded-full bg-white px-3 py-2 text-xs font-medium text-[rgba(55,56,60,0.61)]">
                👥 {trip?.memberCount ?? 4}명
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
