'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Avatar } from '@/shared/components/avatar';
import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { TabBar } from '@/shared/components/tab-bar';
import { getErrorMessage } from '@/shared/lib/api';
import { advanceTripPhase } from '@/shared/session';

import { rememberActiveTrip, useConfirmSchedule, useTripView } from '../trip.hooks';
import { buildTripHref } from '../trip.lib';
import { OngoingTripHomeScreen } from './ongoing-trip-home-screen';

type TripLobbyScreenProps = {
  tripId: string;
};

const HOST_MENU = [
  { key: 'schedule', label: 'AI 일정', description: '일차별 동선 확인', path: 'schedule' },
  { key: 'invite', label: '친구 초대', description: '링크 공유 · 참여 현황', path: 'invite' },
  { key: 'games', label: '미니게임', description: '룰렛 · 사다리로 30초 결정', path: 'games' },
  { key: 'roles', label: '역할 분담', description: '총무·내비·맛집 담당 정하기', path: 'roles' },
  { key: 'todos', label: '개인 할일', description: '준비 체크리스트', path: 'todos' },
  { key: 'settlement', label: '정산하기', description: '지출 기록 · 1인당 금액', path: 'settlement' },
] as const;

const GUEST_MENU = HOST_MENU.filter((item) => item.key !== 'invite');

export const TripLobbyScreen = ({ tripId }: TripLobbyScreenProps) => {
  const router = useRouter();
  const { trip, groupId, isGuest, isLoading, isError, error } = useTripView(tripId);
  const confirmSchedule = useConfirmSchedule(groupId ?? 0);
  const menu = isGuest ? GUEST_MENU : HOST_MENU;

  useEffect(() => {
    if (!isLoading && !isError && !trip) {
      router.replace(isGuest ? '/join' : '/home');
    }
  }, [isError, isGuest, isLoading, router, trip]);

  useEffect(() => {
    rememberActiveTrip(tripId);
  }, [tripId]);

  if (isLoading) {
    return (
      <MobileShell className="bg-surface-gray">
        <div className="flex flex-1 items-center justify-center text-sm text-[rgba(55,56,60,0.61)]">
          그룹을 불러오는 중…
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
          <Button variant="outline" onClick={() => router.push(isGuest ? '/join' : '/home')}>
            {isGuest ? '초대 링크로' : '홈으로'}
          </Button>
        </div>
      </MobileShell>
    );
  }

  const doneCount = trip.members.filter((member) => member.status !== 'pending').length;
  const isOngoing = trip.phase === 'ongoing' || trip.phase === 'settling';

  if (isOngoing) {
    return <OngoingTripHomeScreen tripId={tripId} />;
  }

  const handleStartTrip = async () => {
    if (groupId) {
      try {
        await confirmSchedule.mutateAsync();
      } catch {
        // 일정 확정 API가 실패해도 여행 중 홈으로 이어지게 로컬 상태를 진행합니다.
      }
    }
    advanceTripPhase(tripId, 'ongoing');
  };

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-3 pb-4">
        <Header title="일행 대기실" onBack={isGuest ? undefined : () => router.push('/home')} />

        {isError ? <p className="text-sm font-medium text-[#e08300]">{getErrorMessage(error)}</p> : null}

        <section className="border-line-hairline rounded-2xl border bg-white px-5 py-5">
          <p className="text-text-secondary-soft text-xs font-bold">{trip.dDayLabel ?? trip.phase}</p>
          <h2 className="text-ink-900 mt-1 text-[22px] font-bold tracking-[-0.5px]">{trip.title}</h2>
          <p className="text-text-secondary-soft mt-1 text-sm font-medium">
            {trip.dateLabel} · {trip.destination}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center">
              {trip.members.map((member, index) => (
                <Avatar
                  key={member.id}
                  member={member.member}
                  size="sm"
                  initial={member.name.slice(0, 1)}
                  className={index === 0 ? '' : '-ml-2 ring-2 ring-white'}
                />
              ))}
            </div>
            <p className="text-text-secondary-soft text-sm font-medium">
              {doneCount}/{trip.memberCount} 참여
            </p>
          </div>
        </section>

        <ul className="flex flex-col gap-2.5">
          {menu.map((item) => (
            <li key={item.key}>
              <Link
                href={buildTripHref(tripId, item.path)}
                className="border-line-hairline flex items-center justify-between rounded-2xl border bg-white px-[18px] py-4"
              >
                <span className="flex flex-col gap-0.5">
                  <span className="text-ink-900 text-[15px] font-bold">{item.label}</span>
                  <span className="text-text-secondary-soft text-[12.5px] font-medium">{item.description}</span>
                </span>
                <span className="text-[20px] font-bold text-[rgba(55,56,60,0.28)]" aria-hidden>
                  ›
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {!isGuest && trip.phase !== 'ongoing' && trip.phase !== 'settled' ? (
          <Button
            variant="primary"
            fullWidth
            disabled={confirmSchedule.isPending}
            onClick={() => void handleStartTrip()}
          >
            {confirmSchedule.isPending ? '일정을 확정하는 중…' : '여행 시작하기'}
          </Button>
        ) : null}
        {confirmSchedule.isError ? (
          <p className="text-sm font-medium text-[#e08300]">{getErrorMessage(confirmSchedule.error)}</p>
        ) : null}
      </div>
      <TabBar />
    </MobileShell>
  );
};
