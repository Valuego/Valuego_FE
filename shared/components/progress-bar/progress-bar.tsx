import { cn } from '@/shared/lib/cn';

type ProgressBarProps = {
  value: number;
  className?: string;
  trackClassName?: string;
  indicatorClassName?: string;
};

export const ProgressBar = ({ value, className, trackClassName, indicatorClassName }: ProgressBarProps) => {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={cn('bg-line-hairline h-2.5 w-full overflow-hidden rounded-full', className, trackClassName)}
    >
      <div
        className={cn('bg-brand-blue h-full rounded-full transition-[width]', indicatorClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};
