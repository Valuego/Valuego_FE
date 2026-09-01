'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { TabBar } from '@/shared/components/tab-bar';
import { useActiveTrip, useTripById } from '@/shared/session';

import { GAMES } from '../minigame.constants';

type MinigameHubScreenProps = {
  tripId?: string;
};

export const MinigameHubScreen = ({ tripId }: MinigameHubScreenProps) => {
  const router = useRouter();
  const activeTrip = useActiveTrip();
  const tripFromId = useTripById(tripId ?? '');
  const trip = tripId ? tripFromId : activeTrip;
  const recent = trip?.timeline[0];
  const basePath = trip ? `/trips/${trip.id}/games` : null;

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-3 px-5 pt-3 pb-4">
        <Header title="미니게임" onBack={() => router.push(trip ? `/trips/${trip.id}` : '/home')} />

        <div className="flex items-start rounded-xl bg-[rgba(101,65,242,0.06)] px-3.5 py-3">
          <p className="text-brand-purple flex-1 text-[12.5px] font-semibold">
            🎮 애매한 결정, 눈치 게임 대신 30초 만에 정해요.
          </p>
        </div>

        {!trip ? (
          <div className="border-line-hairline rounded-2xl border bg-white p-[18px]">
            <p className="text-ink-900 text-sm font-bold">진행 중인 여행이 없어요</p>
            <p className="text-text-secondary-soft mt-1 text-[12.5px] font-medium">
              대기실에서 미니게임을 열 수 있어요.
            </p>
            <Link href="/trips/new" className="text-brand-blue mt-3 inline-block text-sm font-bold">
              새 여행 만들기 →
            </Link>
          </div>
        ) : (
          <p className="text-text-secondary-soft text-xs font-medium">{trip.title} · 게임 허브</p>
        )}

        <ul className="flex flex-col gap-3">
          {GAMES.map((game) => (
            <li key={game.slug}>
              <Link
                href={basePath ? `${basePath}/${game.slug}` : '/trips/join'}
                className="border-line-hairline flex items-center gap-3.5 overflow-hidden rounded-2xl border bg-white p-[18px]"
              >
                <span
                  className={`flex size-12 shrink-0 items-center justify-center rounded-[14px] text-2xl ${game.iconBg}`}
                  aria-hidden
                >
                  {game.emoji}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-ink-900 text-base font-bold tracking-[-0.2px]">{game.title}</span>
                  <span className="text-text-secondary-soft text-[12.5px] font-medium">{game.description}</span>
                </span>
                <span className="text-[20px] font-bold text-[rgba(55,56,60,0.28)]" aria-hidden>
                  ›
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="text-[12px] font-medium text-[rgba(55,56,60,0.28)]">
          {recent ? `최근 기록: ${recent.label}` : '게임 결과는 타임라인에 자동 기록돼요.'}
        </p>
      </div>
      <TabBar />
    </MobileShell>
  );
};
