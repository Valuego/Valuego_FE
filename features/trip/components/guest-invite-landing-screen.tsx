'use client';

import { useRouter } from 'next/navigation';

import { Avatar } from '@/shared/components/avatar';
import { Button } from '@/shared/components/button';
import { MobileShell } from '@/shared/components/mobile-shell';

import { INVITE_HIGHLIGHTS } from '../trip.constants';
import { buildInvitePath } from '../trip.lib';
import { GuestUrlBar } from './guest-invite-chrome';

type GuestInviteLandingScreenProps = {
  code: string;
};

export const GuestInviteLandingScreen = ({ code }: GuestInviteLandingScreenProps) => {
  const router = useRouter();

  const handleJoin = () => {
    router.push(`${buildInvitePath(code)}/onboarding`);
  };

  return (
    <MobileShell className="bg-white">
      <GuestUrlBar groupLink={code} />
      <div className="flex flex-1 flex-col items-center justify-center px-5">
        <div className="flex w-full max-w-[340px] flex-col items-center gap-4">
          <Avatar member="doyeon" size="md" className="size-10 text-base" />
          <h1 className="text-ink-900 text-center text-xl font-bold tracking-[-0.4px]">친구가 초대했어요 💌</h1>
          <p className="text-text-secondary-soft text-sm font-medium">함께 떠날 여행 준비를 도와주세요</p>
          <div className="bg-surface-gray flex w-full flex-col items-center gap-2.5 rounded-[18px] p-[22px]">
            <p className="text-ink-900 text-[22px] font-bold tracking-[-0.4px]">우정여행</p>
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
          1분 만에 참여하기
        </Button>
        <p className="text-text-secondary-soft mt-3 text-center text-[13.5px] font-medium">
          앱 설치 · 회원가입 필요 없어요
        </p>
      </div>
    </MobileShell>
  );
};
