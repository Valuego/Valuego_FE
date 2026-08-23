'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import BellIcon from '@/shared/assets/icons/bell.svg';
import HomeIcon from '@/shared/assets/icons/home.svg';
import UserCircleIcon from '@/shared/assets/icons/user-circle.svg';
import { cn } from '@/shared/lib/cn';

const TABS = [
  { href: '/home', label: '홈', Icon: HomeIcon },
  { href: '/games', label: '미니게임', emoji: '🎮' },
  { href: '/notifications', label: '알림', Icon: BellIcon },
  { href: '/my', label: '마이', Icon: UserCircleIcon },
] as const;

export const TabBar = () => {
  const pathname = usePathname();

  return (
    <nav className="border-divider-1 sticky bottom-0 z-20 w-full border-t bg-white pb-[env(safe-area-inset-bottom)]">
      <ul className="flex h-[49px] items-stretch">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);

          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className={cn(
                  'flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-bold',
                  isActive ? 'text-ink-900 opacity-100' : 'text-[#464a4d] opacity-70',
                )}
              >
                {'emoji' in tab ? (
                  <span className="flex size-6 items-center justify-center text-[18px] leading-none" aria-hidden>
                    {tab.emoji}
                  </span>
                ) : (
                  <tab.Icon className="size-6" aria-hidden />
                )}
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
