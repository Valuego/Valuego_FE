'use client';

import type { ComponentProps } from 'react';

import KakaoIcon from '@/shared/assets/icons/kakao.svg';
import { cn } from '@/shared/lib/cn';

type KakaoLoginButtonProps = Omit<ComponentProps<'button'>, 'children'> & {
  label?: string;
};

export const KakaoLoginButton = ({
  className,
  label = '카카오로 3초만에 시작하기',
  type = 'button',
  ...restProps
}: KakaoLoginButtonProps) => {
  return (
    <button
      type={type}
      className={cn(
        'bg-brand-kakao text-ink-900 flex h-14 w-full min-w-[91px] cursor-pointer items-center justify-center gap-1 rounded-lg px-7 text-center text-base font-bold',
        'transition-opacity hover:opacity-90 active:opacity-80',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...restProps}
    >
      <span className="relative flex size-6 shrink-0 items-center justify-center" aria-hidden>
        <KakaoIcon className="text-ink-900 h-[18px] w-[19.5px]" />
      </span>
      <span className="min-w-0 flex-1">{label}</span>
    </button>
  );
};
