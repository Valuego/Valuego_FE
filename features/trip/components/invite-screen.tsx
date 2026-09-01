'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Avatar } from '@/shared/components/avatar';
import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { InfoBanner } from '@/shared/components/info-banner';
import { MobileShell } from '@/shared/components/mobile-shell';
import { StatusPill } from '@/shared/components/status-pill';
import { advanceTripPhase, joinMembersDemo, useTripById } from '@/shared/session';

type InviteScreenProps = {
  tripId: string;
};

export const InviteScreen = ({ tripId }: InviteScreenProps) => {
  const router = useRouter();
  const trip = useTripById(tripId);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!trip) {
      router.replace('/home');
    }
  }, [router, trip]);

  if (!trip) {
    return null;
  }

  const isEmpty = trip.members.length <= 1;
  const completedCount = trip.members.filter((member) => member.status !== 'pending').length;
  const inviteUrl = trip.inviteCode;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${inviteUrl}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleSimulateJoin = () => {
    joinMembersDemo(tripId);
  };

  const handleContinue = () => {
    if (isEmpty) {
      router.push(`/trips/${tripId}`);
      return;
    }
    advanceTripPhase(tripId, 'planning');
    router.push(`/trips/${tripId}`);
  };

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-5 px-5 pt-3 pb-28">
        <Header title="친구 초대하기" />
        <InfoBanner accent="blue" message="링크로 초대하면 자동으로 그룹에 참여해요" />

        <div className="border-line-hairline flex items-center justify-between rounded-[10px] border bg-white py-[11px] pr-2.5 pl-3">
          <p className="text-text-secondary-soft text-[13px] font-medium">{inviteUrl}</p>
          <button
            type="button"
            onClick={handleCopy}
            className="text-brand-blue rounded-lg bg-[rgba(51,102,255,0.08)] px-3 py-[7px] text-[12.5px] font-bold"
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
                <Avatar member={member.member} size="sm" className="size-9 text-sm" />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="text-ink-900 text-sm font-bold">{member.name}</p>
                  <p className="text-text-secondary-soft text-xs font-medium">{member.role}</p>
                </div>
                {member.status === 'done' ? (
                  <span className="text-brand-success text-sm font-bold">{member.statusLabel}</span>
                ) : (
                  <StatusPill label={member.statusLabel} tone="pending" />
                )}
              </li>
            ))}
          </ul>

          {isEmpty ? (
            <div className="border-line-hairline flex flex-col items-center gap-2 border-t px-6 pt-5 pb-7 text-center">
              <div
                className="mb-1 flex size-[74px] items-center justify-center rounded-full bg-black/10 text-[40px] font-bold text-[rgba(55,56,60,0.28)]"
                aria-hidden
              >
                ?
              </div>
              <p className="text-ink-900 text-base font-bold">아직 친구가 참여하기 전이에요</p>
              <p className="text-text-subtle text-sm leading-[1.5]">
                친구가 초대를 수락하면 목록에 나타나요.
                <br />
                성향 입력까지 마치면 완료로 표시돼요.
              </p>
              <Button
                variant="soft"
                className="mt-2 h-12 w-full max-w-[314px] text-sm font-medium"
                onClick={handleCopy}
              >
                카카오톡으로 초대하기
              </Button>
              <Button variant="outline" className="h-12 w-full max-w-[314px]" onClick={handleSimulateJoin}>
                친구 참여 시뮬레이트
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="bg-surface-gray fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[430px] px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <Button variant="primary" fullWidth onClick={handleContinue}>
          여행 스타일 정하러 가기
        </Button>
      </div>
    </MobileShell>
  );
};
