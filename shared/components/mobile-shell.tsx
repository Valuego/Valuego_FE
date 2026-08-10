import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

type MobileShellProps = {
  children: ReactNode;
  className?: string;
};

/** PWA 모바일 뷰포트 셸 — 디자인 기준 폭(402)에 맞추고 safe-area를 반영한다. */
export const MobileShell = ({ children, className }: MobileShellProps) => {
  return (
    <div
      className={cn(
        'bg-auth-gradient-from mx-auto flex min-h-dvh w-full max-w-[430px] flex-col',
        'pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]',
        className,
      )}
    >
      {children}
    </div>
  );
};
