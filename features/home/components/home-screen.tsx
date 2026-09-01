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
          <div className="flex w-[240px] flex-col gap-0.5">
            <p className="text-text-secondary-soft text-sm font-medium">{session.user.greetingName}님, 안녕하세요</p>
            <h1 className="text-ink-900 text-[22px] font-bold tracking-[-0.5px]">이번엔 어디로 떠나볼까요?</h1>
          </div>
          <Link
            href="/my/notifications"
            aria-label="알림"
            className="relative flex size-11 shrink-0 items-center justify-center"
          >
            <BellIcon className="size-6 opacity-70" aria-hidden />
          </Link>
        </div>

        {hasActiveTrip && activeTrip ? (
          <>
            <Link
              href={`/trips/${activeTrip.id}`}
              className="border-line-hairline flex flex-col gap-3 rounded-2xl border bg-white px-6 pt-5 pb-7 shadow-[0px_1px_8px_rgba(23,23,25,0.08)]"
            >
              <span className="border-line-hairline inline-flex h-5 w-fit items-center gap-1.5 rounded-2xl border bg-white px-2">
                <span className="bg-brand-success size-2 shrink-0 rounded-full" />
                <span className="text-text-secondary-soft text-xs font-bold">{activeTrip.dDayLabel ?? '진행 중'}</span>
              </span>
              <p className="text-text-basic text-[22px] leading-[1.4] font-bold tracking-[-0.5px]">
                {activeTrip.title}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {activeTrip.members.map((member, index) => (
                    <Avatar
                      key={member.id}
                      member={member.member}
                      size="sm"
                      className={index === 0 ? 'size-7 text-[10px]' : '-ml-2 size-7 text-[10px] ring-2 ring-white'}
                    />
                  ))}
                </div>
                <span className="text-text-body text-sm font-medium">일정 보기 →</span>
              </div>
            </Link>

            <Button asChild variant="primary" fullWidth>
              <Link href="/trips/new">새 여행 계획 만들기</Link>
            </Button>
          </>
        ) : (
          <div className="border-line-hairline flex flex-col items-center gap-2 rounded-2xl border bg-white px-6 pt-5 pb-7">
            <div
              className="flex size-[74px] items-center justify-center rounded-full bg-[#edf0fa] text-[40px]"
              aria-hidden
            >
              ✈️
            </div>
            <p className="text-ink-900 text-base font-bold">아직 여행이 없어요</p>
            <p className="text-text-subtle text-center text-sm leading-[1.5]">
              날짜와 도시만 정해도 시작할 수 있어요.
              <br />
              나머지는 친구들과 채워 가면 돼요.
            </p>
            <Button asChild variant="primary" fullWidth className="mt-1">
              <Link href="/trips/new">새 여행 계획 만들기</Link>
            </Button>
          </div>
        )}

        <p className="text-[13px] font-bold tracking-[0.3px] text-[rgba(55,56,60,0.28)]">지난 여행</p>

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
                  <span className="text-brand-success shrink-0 text-[12.5px] font-bold">정산 완료</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="border-line-hairline flex h-[57px] items-center justify-center rounded-xl border bg-white px-4">
            <p className="text-[14px] font-medium text-[rgba(55,56,60,0.28)]">지난 여행 기록이 여기에 쌓여요</p>
          </div>
        )}
      </div>
      <TabBar />
    </MobileShell>
  );
};
