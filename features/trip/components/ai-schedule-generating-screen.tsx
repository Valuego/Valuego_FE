import { MobileShell } from '@/shared/components/mobile-shell';

export const AiScheduleGeneratingScreen = () => {
  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-10">
        <div
          className="size-20 animate-spin rounded-full border-[8px] border-[rgba(51,102,255,0.16)] border-t-[#3366ff]"
          aria-hidden
        />
        <h1 className="text-ink-900 text-center text-[22px] font-bold tracking-[-0.5px]">AI가 일정을 짜고 있어요</h1>
        <p className="text-text-secondary-soft text-sm font-medium">동선을 최적화하는 중...</p>
        <div className="flex w-full max-w-[320px] flex-col gap-2.5" aria-hidden>
          <div className="h-3.5 w-full rounded-[7px] bg-[rgba(112,115,125,0.12)]" />
          <div className="h-3.5 w-[85%] rounded-[7px] bg-[rgba(112,115,125,0.12)]" />
          <div className="h-3.5 w-[60%] rounded-[7px] bg-[rgba(112,115,125,0.12)]" />
        </div>
      </div>
    </MobileShell>
  );
};
