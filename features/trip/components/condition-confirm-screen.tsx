'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { InfoBanner } from '@/shared/components/info-banner';
import { MobileShell } from '@/shared/components/mobile-shell';

const SUMMARY_ROWS = [
  { label: '목적지', value: '부산' },
  { label: '기간', value: '2박 3일' },
  { label: '인원', value: '4명' },
  { label: '예산', value: '적당히' },
  { label: '음식', value: '한식' },
] as const;

export const ConditionConfirmScreen = () => {
  const router = useRouter();

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-3 pb-28">
        <Header title="AI 일정 생성 준비" />

        <ul className="border-line-hairline overflow-hidden rounded-2xl border bg-white px-[18px]">
          {SUMMARY_ROWS.map((row) => (
            <li
              key={row.label}
              className="border-line-hairline flex items-center justify-between border-b py-[15px] last:border-b-0"
            >
              <span className="text-text-secondary-soft text-sm font-medium">{row.label}</span>
              <span className="text-ink-900 text-sm font-bold">{row.value}</span>
            </li>
          ))}
        </ul>

        <InfoBanner accent="purple" message="AI가 성향과 동선을 반영해 일정을 만들어요." />
      </div>

      <div className="bg-surface-gray fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[430px] px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <Button variant="primary" fullWidth onClick={() => router.push('/trips/busan-2026/invite')}>
          AI 일정 생성하기
        </Button>
      </div>
    </MobileShell>
  );
};
