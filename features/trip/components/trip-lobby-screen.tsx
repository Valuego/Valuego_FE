'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Avatar } from '@/shared/components/avatar';
import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { TabBar } from '@/shared/components/tab-bar';
import { advanceTripPhase, useTripById } from '@/shared/session';

type TripLobbyScreenProps = {
  tripId: string;
};

const MENU = [
  { key: 'invite', label: '친구 초대', description: '링크 공유 · 참여 현황', path: 'invite' },
  { key: 'games', label: '미니게임', description: '룰렛 · 사다리로 30초 결정', path: 'games' },
  { key: 'roles', label: '역할 분담', description: '총무·내비·맛집 담당 정하기', path: 'roles' },
  { key: 'todos', label: '개인 할일', description: '준비 체크리스트', path: 'todos' },
  { key: 'settlement', label: '정산하기', description: '지출 기록 · 1인당 금액', path: 'settlement' },
] as const;

export const TripLobbyScreen = ({ tripId }: TripLobbyScreenProps) => {
  const router = useRouter();
  const trip = useTripById(tripId);

  useEffect(() => {
    if (!trip) {
      router.replace('/home');
    }
  }, [router, trip]);

  if (!trip) {
    return null;
  }

  const doneCount = trip.members.filter((member) => member.status !== 'pending').length;

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-3 pb-4">
        <Header title="일행 대기실" onBack={() => router.push('/home')} />

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
                  className={index === 0 ? '' : '-ml-2 ring-2 ring-white'}
                />
              ))}
            </div>
            <p className="text-text-secondary-soft text-sm font-medium">
              {doneCount}/{trip.memberCount} 참여
            </p>
          </div>
          {trip.timeline[0] ? (
            <p className="text-text-secondary-soft mt-3 text-xs font-medium">최근: {trip.timeline[0].label}</p>
          ) : null}
        </section>

        <ul className="flex flex-col gap-2.5">
          {MENU.map((item) => (
            <li key={item.key}>
              <Link
                href={`/trips/${tripId}/${item.path}`}
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

        {trip.phase !== 'ongoing' && trip.phase !== 'settled' ? (
          <Button variant="primary" fullWidth onClick={() => advanceTripPhase(tripId, 'ongoing')}>
            여행 시작하기
          </Button>
        ) : null}
      </div>
      <TabBar />
    </MobileShell>
  );
};
