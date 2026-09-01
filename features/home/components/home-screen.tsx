'use client';

import Link from 'next/link';

import BellIcon from '@/shared/assets/icons/bell.svg';
import { Avatar } from '@/shared/components/avatar';
import { Button } from '@/shared/components/button';
import { MobileShell } from '@/shared/components/mobile-shell';
import { TabBar } from '@/shared/components/tab-bar';
import { useActiveTrip, useAppSession, useSettledTrips } from '@/shared/session';

export const HomeScreen = () => {
  const session = useAppSession();
  const activeTrip = useActiveTrip();
  const settledTrips = useSettledTrips();
  const hasActiveTrip = Boolean(activeTrip && activeTrip.phase !== 'settled');

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-3 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <p className="text-text-secondary-soft text-sm font-medium">{session.user.greetingName}님, 안녕하세요</p>
            <h1 className="text-ink-900 text-[22px] font-bold tracking-[-0.5px]">이번엔 어디로 떠나볼까요?</h1>
          </div>
          <Link href="/notifications" aria-label="알림" className="flex size-11 items-center justify-center opacity-70">
            <BellIcon className="size-6" />
          </Link>
        </div>

        {hasActiveTrip && activeTrip ? (
          <Link
            href={`/trips/${activeTrip.id}`}
            className="border-line-hairline flex flex-col gap-3 rounded-2xl border bg-white px-6 pt-5 pb-7 shadow-[0px_1px_8px_rgba(23,23,25,0.08)]"
          >
            <span className="border-line-hairline inline-flex h-5 w-fit items-center gap-1.5 rounded-2xl border bg-white px-2">
              <span className="bg-brand-success size-2 rounded-full" />
              <span className="text-text-secondary-soft text-xs font-bold">{activeTrip.dDayLabel ?? '진행 중'}</span>
            </span>
            <p className="text-text-basic text-[22px] font-bold tracking-[-0.5px]">{activeTrip.title}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {activeTrip.members.map((member, index) => (
                  <Avatar
                    key={member.id}
                    member={member.member}
                    size="sm"
                    className={index === 0 ? '' : '-ml-2 ring-2 ring-white'}
                  />
                ))}
              </div>
              <span className="text-text-body text-sm font-medium">대기실 열기 →</span>
            </div>
            {activeTrip.timeline[0] ? (
              <p className="text-text-secondary-soft text-xs font-medium">최근: {activeTrip.timeline[0].label}</p>
            ) : null}
          </Link>
        ) : (
          <div className="border-line-hairline flex flex-col items-center gap-2 rounded-2xl border bg-white px-6 pt-5 pb-7">
            <div className="flex size-[74px] items-center justify-center rounded-full bg-[#edf0fa] text-[40px]">✈️</div>
            <p className="text-ink-900 text-base font-bold">아직 여행이 없어요</p>
            <p className="text-text-subtle text-center text-sm leading-[1.5]">
              여행을 만들거나, 참여 코드로 일행에 합류하세요.
            </p>
            <Button asChild variant="primary" fullWidth className="mt-2">
              <Link href="/trips/new">새 여행 계획 만들기</Link>
            </Button>
            <Button asChild variant="outline" fullWidth>
              <Link href="/trips/join">참여 코드로 합류</Link>
            </Button>
          </div>
        )}

        {hasActiveTrip && activeTrip ? (
          <div className="flex flex-col gap-2.5">
            <Button asChild variant="primary" fullWidth>
              <Link href={`/trips/${activeTrip.id}/games`}>미니게임 하러 가기</Link>
            </Button>
            <Button asChild variant="outline" fullWidth>
              <Link href="/trips/join">참여 코드로 합류</Link>
            </Button>
            <Button asChild variant="outline" fullWidth>
              <Link href="/trips/new">새 여행 계획 만들기</Link>
            </Button>
          </div>
        ) : null}

        <p className="text-text-placeholder text-[13px] font-bold tracking-[0.3px]">지난 여행</p>

        {settledTrips.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {settledTrips.slice(0, 2).map((trip) => (
              <li key={trip.id}>
                <Link
                  href={`/trips/${trip.id}/settlement`}
                  className="border-line-hairline flex h-20 items-center gap-3 rounded-xl border bg-white px-4 py-3.5 shadow-[0px_1px_8px_rgba(23,23,25,0.08)]"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="text-ink-900 text-base font-bold tracking-[-0.2px]">{trip.title}</p>
                    <p className="text-text-secondary-soft text-xs font-medium">{trip.dateLabel}</p>
                  </div>
                  <span className="text-brand-success text-[12.5px] font-bold">정산 완료</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="border-line-hairline flex h-[57px] items-center justify-center rounded-xl border bg-white px-4">
            <p className="text-text-placeholder text-sm font-medium">지난 여행 기록이 여기에 쌓여요</p>
          </div>
        )}
      </div>
      <TabBar />
    </MobileShell>
  );
};
