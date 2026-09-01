'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Avatar } from '@/shared/components/avatar';
import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { InfoBanner } from '@/shared/components/info-banner';
import { MobileShell } from '@/shared/components/mobile-shell';
import { StatusPill } from '@/shared/components/status-pill';
import { getErrorMessage } from '@/shared/lib/api';

import { rememberActiveTrip, useTripView } from '../trip.hooks';

type InviteScreenProps = {
  tripId: string;
};

export const InviteScreen = ({ tripId }: InviteScreenProps) => {
  const router = useRouter();
  const { trip, isLoading, isError, error } = useTripView(tripId);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isLoading && !isError && !trip) {
      router.replace('/home');
    }
  }, [isError, isLoading, router, trip]);

  useEffect(() => {
    if (trip) {
      rememberActiveTrip(trip.id);
    }
  }, [trip]);

  if (isLoading) {
    return (
      <MobileShell className="bg-surface-gray">
        <div className="flex flex-1 items-center justify-center text-sm text-[rgba(55,56,60,0.61)]">
          초대 정보를 불러오는 중…
        </div>
      </MobileShell>
    );
  }

  if (!trip) {
    return (
      <MobileShell className="bg-surface-gray">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 text-center">
          <p className="text-sm font-medium text-[#e08300]">
            {isError ? getErrorMessage(error) : '그룹을 찾을 수 없어요.'}
          </p>
          <Button variant="outline" onClick={() => router.push('/home')}>
            홈으로
          </Button>
        </div>
      </MobileShell>
    );
  }

  const completedCount = trip.members.filter((member) => member.status !== 'pending').length;
  const inviteUrl =
    typeof window === 'undefined' ? trip.inviteCode : `${window.location.origin}/trips/join?code=${trip.inviteCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-5 px-5 pt-3 pb-28">
        <Header title="친구 초대하기" />
        <InfoBanner
          accent="blue"
          message="링크를 복사해 단톡방에 공유하세요. 게스트 참여 API는 백엔드 개방 후 연동됩니다."
        />

        {isError ? <p className="text-sm font-medium text-[#e08300]">{getErrorMessage(error)}</p> : null}

        <div className="border-line-hairline flex items-center justify-between rounded-[10px] border bg-white py-[11px] pr-2.5 pl-3">
          <p className="text-text-secondary-soft mr-3 truncate text-[13px] font-medium">{inviteUrl}</p>
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="text-brand-blue shrink-0 rounded-lg bg-[rgba(51,102,255,0.08)] px-3 py-[7px] text-[12.5px] font-bold"
          >
            {copied ? '복사됨' : 'URL 복사'}
          </button>
        </div>

        <div className="flex items-center justify-between text-[13px] font-bold">
          <p className="text-text-secondary-soft">참여 현황</p>
          <p className="text-text-body">
            {completedCount}/{trip.memberCount} 완료
          </p>
        </div>

        <div className="border-line-hairline overflow-hidden rounded-2xl border bg-white">
          <ul>
            {trip.members.map((member) => (
              <li key={member.id} className="flex items-center gap-3 px-3.5 py-3">
                <Avatar member={member.member} size="sm" initial={member.name.slice(0, 1)} className="size-9 text-sm" />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="text-ink-900 text-sm font-bold">{member.name}</p>
                  <p className="text-text-secondary-soft text-xs font-medium">{member.role}</p>
                </div>
                {member.status === 'done' || member.status === 'host' ? (
                  <span className="text-brand-success text-sm font-bold">{member.statusLabel}</span>
                ) : (
                  <StatusPill label={member.statusLabel} tone="pending" />
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-surface-gray fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[430px] px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <Button variant="primary" fullWidth onClick={() => router.push(`/trips/${tripId}`)}>
          대기실로 돌아가기
        </Button>
      </div>
    </MobileShell>
  );
};
