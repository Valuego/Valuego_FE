import { cn } from '@/shared/lib/cn';

type StepDotsProps = {
  stepIds: readonly string[];
  current: number;
};

export const StepDots = ({ stepIds, current }: StepDotsProps) => {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden>
      {stepIds.map((stepId, index) => {
        const isActive = index === current;

        return (
          <span
            key={stepId}
            className={cn(
              'rounded-full transition-all',
              isActive ? 'bg-brand-blue h-2 w-6' : 'bg-line-hairline size-2',
            )}
          />
        );
      })}
    </div>
  );
};
