'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import CloseIcon from '@/shared/assets/icons/close.svg';
import { MobileShell } from '@/shared/components/mobile-shell';
import { useAppSession } from '@/shared/session';

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  timeLabel: string;
  href: string;
};

const buildNotifications = (session: ReturnType<typeof useAppSession>): NotificationItem[] => {
  const items: NotificationItem[] = [];
  const joinedTrip = session.trips.find(
    (trip) => trip.members.length >= trip.memberCount && trip.members.every((member) => member.status !== 'pending'),
  );
  const reviewTrip = session.trips.find((trip) => trip.phase === 'settling' || trip.phase === 'settled');

  if (reviewTrip) {
    items.push({
      id: `review-${reviewTrip.id}`,
      title: '모든 멤버가 회고 작성을 완료했습니다.',
      description: '수고 가치 결과를 확인해보세요.',
      timeLabel: '1시간 전',
      href: `/trips/${reviewTrip.id}/settlement`,
    });
  }
  if (joinedTrip) {
    items.push({
      id: `joined-${joinedTrip.id}`,
      title: '모든 멤버가 그룹에 참여했습니다.',
      description: '이어서 여행 계획을 마무리하세요.',
      timeLabel: '1시간 전',
      href: `/trips/${joinedTrip.id}`,
    });
  }

  return items;
};

export const NotificationsScreen = () => {
  const router = useRouter();
  const session = useAppSession();
  const items = buildNotifications(session);

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex h-[61px] items-center justify-between border-b border-[#e5e7eb] bg-white/50 px-5">
        <h1 className="text-ink-900 text-base font-bold">알림</h1>
        <button
          type="button"
          aria-label="닫기"
          className="flex size-11 items-center justify-center"
          onClick={() => router.push('/home')}
        >
          <CloseIcon className="size-6" aria-hidden />
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-text-secondary-soft px-5 py-10 text-sm font-medium">아직 도착한 알림이 없어요.</p>
      ) : (
        <ul className="flex flex-col border-t border-[#e5e7eb] bg-white">
          {items.map((item) => (
            <li key={item.id} className="bg-brand-blue/8">
              <Link href={item.href} className="flex gap-3 px-4 py-3">
                <span className="bg-brand-blue mt-[6px] size-2 shrink-0 rounded-full" />
                <span className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-ink-900 text-sm leading-[1.5] font-medium">{item.title}</span>
                  <span className="text-text-secondary-soft text-xs font-medium">{item.description}</span>
                  <span className="text-[12px] font-medium text-[rgba(55,56,60,0.28)]">{item.timeLabel}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </MobileShell>
  );
};
