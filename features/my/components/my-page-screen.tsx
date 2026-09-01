'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { MEMBER_COLOR_TO_KEY, useLogout, useUserProfileQuery } from '@/features/auth';
import KakaoIcon from '@/shared/assets/icons/kakao.svg';
import { Avatar } from '@/shared/components/avatar';
import { Button } from '@/shared/components/button';
import { MobileShell } from '@/shared/components/mobile-shell';
import { TabBar } from '@/shared/components/tab-bar';
import { useAppSession } from '@/shared/session';

const MENU_ITEMS = [
  { href: '/my/personality', label: '내 성향 카드' },
  { href: '/my/notifications', label: '알림 설정' },
  { href: '/my/settlements', label: '지난 정산 내역' },
  { href: '/my/terms', label: '약관·개인정보' },
] as const;

export const MyPageScreen = () => {
  const router = useRouter();
  const session = useAppSession();
  const profileQuery = useUserProfileQuery();
  const logout = useLogout();
  const profile = profileQuery.data;
  const name = profile?.nickname ?? session.user.name;
  const email = profile?.email ?? session.user.email;
  const member = profile ? MEMBER_COLOR_TO_KEY[profile.memberColor] : session.user.member;

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.replace('/login');
  };

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-4 pb-4">
        <h1 className="text-ink-900 text-[22px] font-bold tracking-[-0.5px]">마이페이지</h1>

        <div className="border-line-hairline flex items-center gap-3.5 rounded-2xl border bg-white p-[18px]">
          <Avatar member={member} size="lg" initial={name.slice(0, 1)} />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="text-ink-900 text-lg font-bold tracking-[-0.3px]">{name}</p>
            <div className="flex items-center gap-2">
              <p className="text-text-secondary-soft text-[13px] font-medium">{email}</p>
              <span className="bg-brand-kakao flex size-[18px] items-center justify-center rounded-full">
                <KakaoIcon className="h-2.5 w-3" aria-hidden />
              </span>
            </div>
          </div>
        </div>

        <ul className="border-line-hairline overflow-hidden rounded-2xl border bg-white">
          {MENU_ITEMS.map((item, index) => (
            <li key={item.href} className={index < MENU_ITEMS.length - 1 ? 'border-line-hairline border-b' : ''}>
              <Link href={item.href} className="text-ink-900 flex h-[62px] items-center px-[18px] text-sm font-medium">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <Button variant="outline" fullWidth disabled={logout.isPending} onClick={() => void handleLogout()}>
          {logout.isPending ? '로그아웃 중…' : '로그아웃'}
        </Button>
      </div>
      <TabBar />
    </MobileShell>
  );
};
