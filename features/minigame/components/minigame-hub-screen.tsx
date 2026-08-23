'use client';

import Link from 'next/link';

import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { TabBar } from '@/shared/components/tab-bar';

import { GAMES } from '../minigame.constants';

export const MinigameHubScreen = () => {
  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-3 px-5 pt-3 pb-4">
        <Header title="미니게임" />

        <div className="flex items-start rounded-xl bg-[rgba(101,65,242,0.06)] px-3.5 py-3">
          <p className="text-brand-purple flex-1 text-[12.5px] font-semibold">
            🎮 애매한 결정, 눈치 게임 대신 30초 만에 정해요.
          </p>
        </div>

        <ul className="flex flex-col gap-3">
          {GAMES.map((game) => (
            <li key={game.href}>
              <Link
                href={game.href}
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

        <p className="text-[12px] font-medium text-[rgba(55,56,60,0.28)]">게임 결과는 타임라인에 자동 기록돼요.</p>
      </div>
      <TabBar />
    </MobileShell>
  );
};
