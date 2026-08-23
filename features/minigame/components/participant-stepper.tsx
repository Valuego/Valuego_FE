'use client';

import { cn } from '@/shared/lib/cn';

type ParticipantStepperProps = {
  count: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
  className?: string;
};

export const ParticipantStepper = ({ count, min = 2, max = 4, onChange, className }: ParticipantStepperProps) => {
  return (
    <div
      className={cn(
        'border-line-hairline flex h-[52px] items-center justify-between rounded-[14px] border bg-white py-3 pr-3 pl-4',
        className,
      )}
    >
      <p className="text-ink-900 text-[14.5px] font-bold">참가 인원</p>
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="인원 감소"
          disabled={count <= min}
          onClick={() => onChange(Math.max(min, count - 1))}
          className="border-line-hairline flex size-[30px] items-center justify-center rounded-full border bg-white text-[17px] font-medium text-[#e08300] disabled:opacity-40"
        >
          −
        </button>
        <span className="text-ink-900 text-base font-bold">{count}</span>
        <button
          type="button"
          aria-label="인원 증가"
          disabled={count >= max}
          onClick={() => onChange(Math.min(max, count + 1))}
          className="border-line-hairline flex size-[30px] items-center justify-center rounded-full border bg-white text-[17px] font-medium text-[#e08300] disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
};
