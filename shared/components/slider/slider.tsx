'use client';

import type { ComponentProps } from 'react';

import SliderThumbIcon from '@/shared/assets/icons/slider-thumb.svg';
import { cn } from '@/shared/lib/cn';

type SliderProps = Omit<ComponentProps<'input'>, 'type' | 'value' | 'defaultValue' | 'onChange'> & {
  value: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
};

export const Slider = ({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className,
  disabled,
  ...restProps
}: SliderProps) => {
  const clamped = Math.min(max, Math.max(min, value));
  const percent = ((clamped - min) / (max - min)) * 100;

  return (
    <div className={cn('relative h-[26px] w-full', className)}>
      <div className="bg-line-hairline absolute top-[9px] right-0 left-0 h-2 rounded-full" />
      <div className="bg-brand-blue absolute top-[9px] left-0 h-2 rounded-full" style={{ width: `${percent}%` }} />
      <div
        className="pointer-events-none absolute top-0 size-[26px] -translate-x-1/2"
        style={{ left: `${percent}%` }}
        aria-hidden
      >
        <SliderThumbIcon className="size-[26px]" />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamped}
        disabled={disabled}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={clamped}
        onChange={(event) => onValueChange?.(Number(event.target.value))}
        className="absolute inset-0 z-10 m-0 h-full w-full cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed"
        {...restProps}
      />
    </div>
  );
};
