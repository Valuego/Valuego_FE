'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import CloseIcon from '@/shared/assets/icons/close.svg';
import { MobileShell } from '@/shared/components/mobile-shell';
import { getErrorMessage } from '@/shared/lib/api';
import { cn } from '@/shared/lib/cn';

import { useNotificationsQuery } from '../my.hooks';

const formatNotificationTime = (iso?: string | null) => {
  if (!iso) {
    return '';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60_000));
  if (minutes < 1) {
    return '방금 전';
  }
  if (minutes < 60) {
    return `${minutes}분 전`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}시간 전`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}일 전`;
  }
  return date.toLocaleDateString('ko-KR');
};

const notificationHref = (type?: string | null, targetId?: number | null) => {
  if (!targetId) {
    return '/home';
  }
  if (type === 'RETROSPECT_COMPLETE') {
    return `/trips/${targetId}/settlement`;
  }
  return `/trips/${targetId}`;
};

export const NotificationsScreen = () => {
  const router = useRouter();
  const notificationsQuery = useNotificationsQuery();
  const items = notificationsQuery.data ?? [];

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
      {notificationsQuery.isPending ? (
        <p className="text-text-secondary-soft px-5 py-10 text-sm font-medium">알림을 불러오는 중…</p>
      ) : notificationsQuery.isError ? (
        <p className="px-5 py-10 text-sm font-medium text-[#e08300]">
          {getErrorMessage(notificationsQuery.error, '알림을 불러오지 못했어요.')}
        </p>
      ) : items.length === 0 ? (
        <p className="text-text-secondary-soft px-5 py-10 text-sm font-medium">아직 도착한 알림이 없어요.</p>
      ) : (
        <ul className="flex flex-col border-t border-[#e5e7eb] bg-white">
          {items.map((item) => (
            <li key={item.notificationId} className={cn(!item.isRead && 'bg-brand-blue/8')}>
              <Link href={notificationHref(item.type, item.targetId)} className="flex gap-3 px-4 py-3">
                <span className="bg-brand-blue mt-[6px] size-2 shrink-0 rounded-full" />
                <span className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-ink-900 text-sm leading-[1.5] font-medium">{item.title}</span>
                  {item.content ? (
                    <span className="text-text-secondary-soft text-xs font-medium">{item.content}</span>
                  ) : null}
                  {item.notificationCreatedAt ? (
                    <span className="text-[12px] font-medium text-[rgba(55,56,60,0.28)]">
                      {formatNotificationTime(item.notificationCreatedAt)}
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </MobileShell>
  );
};
