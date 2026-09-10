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
import { cn } from '@/shared/lib/cn';
import { seedPendingInvitees, useAppSession, type TripMember } from '@/shared/session';

import { rememberActiveTrip, useTripView } from '../trip.hooks';
import {
  buildInviteShareText,
  buildInviteUrl,
  buildTripHref,
  formatInviteLinkLabel,
  isInviteSeatFilled,
  toInviteStatusLabel,
} from '../trip.lib';

type InviteScreenProps = {
  tripId: string;
};

type InviteToast = 'copied' | 'shared' | null;

const memberPillTone = (statusLabel: string) => {
  if (statusLabel === '완료') {
    return 'done' as const;
  }
  if (statusLabel === '성향 입력 전') {
    return 'idle' as const;
  }
  return 'pending' as const;
};

const isShareAbort = (error: unknown) => {
  return error instanceof DOMException && error.name === 'AbortError';
};

export const InviteScreen = ({ tripId }: InviteScreenProps) => {
  const router = useRouter();
  const session = useAppSession();
  const { trip, isLoading, isError, error } = useTripView(tripId, { refetchInterval: 4000 });
  const [toast, setToast] = useState<InviteToast>(null);

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

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

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

  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  const inviteUrl = origin ? buildInviteUrl(origin, trip.inviteCode) : trip.inviteCode;
  const inviteLabel = formatInviteLinkLabel(trip.inviteCode, origin || undefined);
  const hostName = session.user.greetingName || session.user.name;
  const shareText = buildInviteShareText(hostName, trip.destination);
  const friends = trip.members.filter((member) => member.role === '친구' || member.role === '나');
  const waitingCount = trip.members.filter((member) => toInviteStatusLabel(member) === '대기 중').length;
  const filledCount = trip.members.filter((member) => isInviteSeatFilled(member)).length;
  const canProceed = filledCount === trip.memberCount && trip.memberCount > 0;
  const hostIncomplete = trip.members.some(
    (member) => member.role.includes('호스트') && toInviteStatusLabel(member) !== '완료',
  );
  const showEmptyFriends = friends.length === 0;

  const markInvitesSent = () => {
    seedPendingInvitees(trip.id);
  };

  const handleCopy = async (nextToast: Exclude<InviteToast, null> = 'copied') => {
    const payload = `${shareText}\n${inviteUrl}`;
    try {
      await navigator.clipboard.writeText(payload);
      markInvitesSent();
      setToast(nextToast);
    } catch {
      setToast(null);
    }
  };

  const handleKakaoInvite = async () => {
    const shareData = {
      title: `${trip.destination} 초대`,
      text: shareText,
      url: inviteUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        markInvitesSent();
        setToast('shared');
        return;
      }
    } catch (shareError) {
      if (isShareAbort(shareError)) {
        return;
      }
    }
    await handleCopy('shared');
  };

  const handleProceed = () => {
    if (!canProceed) {
      return;
    }
    if (hostIncomplete) {
      router.push(buildTripHref(tripId, 'style'));
      return;
    }
    router.push(buildTripHref(tripId, 'schedule'));
  };

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-5 px-5 pt-3 pb-28">
        <Header title="친구 초대하기" onBack={() => router.push(buildTripHref(tripId))} />
        <InfoBanner accent="blue" message="링크로 초대하면 자동으로 그룹에 참여해요" />

        {isError ? <p className="text-sm font-medium text-[#e08300]">{getErrorMessage(error)}</p> : null}

        <div className="border-line-hairline flex items-center justify-between rounded-[10px] border bg-white py-[11px] pr-2.5 pl-3">
          <p className="text-text-secondary-soft mr-3 truncate text-[13px] font-medium">{inviteLabel}</p>
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="text-brand-blue shrink-0 rounded-lg bg-[rgba(51,102,255,0.08)] px-3 py-[7px] text-[12.5px] font-bold"
          >
            URL 복사
          </button>
        </div>

        <div className="flex items-center justify-between text-[13px] font-bold">
          <p className="text-text-secondary-soft">참여 현황</p>
          <p className="text-text-body">
            {filledCount}/{trip.memberCount} 완료
          </p>
        </div>

        <div className="border-line-hairline overflow-hidden rounded-2xl border bg-white">
          <ul>
            {trip.members.map((member, index) => (
              <InviteMemberRow key={member.id} member={member} showDivider={index > 0} />
            ))}
          </ul>
          {showEmptyFriends ? (
            <div className="border-line-hairline flex flex-col items-center gap-2 border-t px-6 pt-5 pb-7">
              <div className="flex size-[74px] items-center justify-center rounded-full bg-[rgba(0,0,0,0.1)] text-[40px] font-bold text-[rgba(55,56,60,0.28)]">
                ?
              </div>
              <p className="text-ink-900 mt-2 text-center text-base font-bold">아직 친구가 참여하기 전이에요</p>
              <p className="text-center text-sm leading-[1.5] text-[#4b5563]">
                친구가 링크에 들어오면 목록에 나타나요.
                <br />
                대기 중이 완료로 바뀌어요.
              </p>
              <Button
                variant="soft"
                className="mt-2 h-[52px] w-full max-w-[314px]"
                onClick={() => void handleKakaoInvite()}
              >
                카카오톡으로 초대하기
              </Button>
            </div>
          ) : waitingCount > 0 ? (
            <div className="border-line-hairline border-t px-6 py-4">
              <Button variant="soft" className="h-[52px] w-full" onClick={() => void handleKakaoInvite()}>
                카카오톡으로 초대하기
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {toast ? (
        <div
          className="pointer-events-none fixed bottom-[108px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-[rgba(23,23,25,0.92)] px-4 py-[13px] text-[13.5px] text-white shadow-[0px_8px_14px_rgba(23,23,26,0.3)]"
          role="status"
        >
          <span className="font-bold">✓</span>
          <span className="font-medium">{toast === 'copied' ? '링크를 복사했어요' : '링크가 공유되었어요'}</span>
        </div>
      ) : null}

      <div className="bg-surface-gray fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[430px] px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <Button
          variant="primary"
          fullWidth
          disabled={!canProceed}
          className="disabled:bg-[#d1d5db] disabled:opacity-100 disabled:shadow-none"
          onClick={handleProceed}
        >
          여행 스타일 정하러 가기
        </Button>
      </div>
    </MobileShell>
  );
};

const InviteMemberRow = ({ member, showDivider }: { member: TripMember; showDivider: boolean }) => {
  const statusLabel = toInviteStatusLabel(member);

  return (
    <li className={cn('flex items-center gap-3 px-3.5 py-3', showDivider ? 'border-line-hairline border-t' : '')}>
      <Avatar member={member.member} size="sm" initial={member.name.slice(0, 1)} className="size-9 text-sm" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-ink-900 text-sm font-bold">{member.name}</p>
        <p className="text-text-secondary-soft text-xs font-medium">{member.role}</p>
      </div>
      <StatusPill label={statusLabel} tone={memberPillTone(statusLabel)} />
    </li>
  );
};
