'use client';

import type { ComponentProps } from 'react';

import ToggleThumbIcon from '@/shared/assets/icons/toggle-thumb.svg';
import { cn } from '@/shared/lib/cn';

type ToggleProps = Omit<ComponentProps<'button'>, 'onChange'> & {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export const Toggle = ({ checked, onCheckedChange, className, disabled, ...restProps }: ToggleProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        'relative h-6 w-12 shrink-0 cursor-pointer overflow-hidden rounded-full transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-brand-blue' : 'bg-toggle-off',
        className,
      )}
      {...restProps}
    >
      <span
        className={cn(
          'pointer-events-none absolute top-0.5 size-5 transition-[left]',
          checked ? 'left-[26px]' : 'left-0.5',
        )}
        aria-hidden
      >
        <ToggleThumbIcon className="size-5" />
      </span>
    </button>
  );
};
