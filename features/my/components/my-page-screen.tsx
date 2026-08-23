'use client';

import Link from 'next/link';

import { CURRENT_USER } from '@/features/home';
import KakaoIcon from '@/shared/assets/icons/kakao.svg';
import { Avatar } from '@/shared/components/avatar';
import { MobileShell } from '@/shared/components/mobile-shell';
import { TabBar } from '@/shared/components/tab-bar';

const MENU_ITEMS = [
  { href: '/my/personality', label: '내 성향 카드' },
  { href: '/my/notifications', label: '알림 설정' },
  { href: '/my/settlements', label: '지난 정산 내역' },
  { href: '/my/terms', label: '약관·개인정보' },
] as const;

export const MyPageScreen = () => {
  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-4 pb-4">
        <h1 className="text-ink-900 text-[22px] font-bold tracking-[-0.5px]">마이페이지</h1>

        <div className="border-line-hairline flex items-center gap-3.5 rounded-[18px] border bg-white p-[18px]">
          <Avatar member={CURRENT_USER.member} size="lg" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="text-ink-900 text-lg font-bold tracking-[-0.3px]">{CURRENT_USER.name}</p>
            <div className="flex items-center gap-2">
              <p className="text-text-secondary-soft text-[13px] font-medium">{CURRENT_USER.email}</p>
              <span className="bg-brand-kakao flex size-[18px] items-center justify-center rounded-full">
                <KakaoIcon className="h-2.5 w-3" aria-hidden />
              </span>
            </div>
          </div>
        </div>

        <ul className="border-line-hairline overflow-hidden rounded-[18px] border bg-white">
          {MENU_ITEMS.map((item, index) => (
            <li key={item.href} className={index < MENU_ITEMS.length - 1 ? 'border-line-hairline border-b' : ''}>
              <Link href={item.href} className="text-ink-900 flex h-[62px] items-center px-[18px] text-sm font-medium">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <TabBar />
    </MobileShell>
  );
};
