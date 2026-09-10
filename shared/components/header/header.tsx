'use client';

import type { ComponentProps } from 'react';

import { useRouter } from 'next/navigation';

import ChevronLeftIcon from '@/shared/assets/icons/chevron-left.svg';
import { cn } from '@/shared/lib/cn';

type HeaderProps = {
  title: string;
  onBack?: () => void;
  className?: string;
  backButtonProps?: Omit<ComponentProps<'button'>, 'onClick' | 'type' | 'children'>;
};

export const Header = ({ title, onBack, className, backButtonProps }: HeaderProps) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    router.back();
  };

  return (
    <header className={cn('relative flex h-11 items-center gap-2 overflow-hidden', className)}>
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={handleBack}
        className="relative flex size-6 shrink-0 cursor-pointer items-center justify-center"
        {...backButtonProps}
      >
        <ChevronLeftIcon className="text-ink-900 h-[16px] w-[9.6px] rotate-90" aria-hidden />
      </button>
      <h1 className="text-ink-900 text-[22px] leading-[1.4] font-bold tracking-[-0.5px]">{title}</h1>
    </header>
  );
};
