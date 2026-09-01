'use client';

import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { TabBar } from '@/shared/components/tab-bar';
import { useSettledTrips } from '@/shared/session';

export const SettlementsScreen = () => {
  const settledTrips = useSettledTrips();

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-3.5 px-5 pt-4 pb-4">
        <Header title="지난 정산 내역" />
        {settledTrips.length === 0 ? (
          <div className="border-line-hairline flex h-24 items-center justify-center rounded-2xl border bg-white">
            <p className="text-text-secondary-soft text-sm">정산 완료된 여행이 아직 없어요.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3.5">
            {settledTrips.map((trip) => (
              <li
                key={trip.id}
                className="border-line-hairline flex flex-col gap-2.5 rounded-2xl border bg-white px-5 py-[18px]"
              >
                <div className="flex items-center gap-2">
                  <p className="text-ink-900 text-xl font-bold tracking-[-0.5px]">{trip.title}</p>
                  <div className="min-w-0 flex-1" />
                  <span className="bg-brand-success/13 text-brand-success shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold">
                    정산 완료
                  </span>
                </div>
                <p className="text-[12px] font-medium text-[rgba(55,56,60,0.28)]">{trip.dateLabel}</p>
                <div className="bg-line-hairline h-px" />
                <div className="flex items-center justify-between">
                  <div className="flex w-[140px] flex-col gap-0.5">
                    <p className="text-text-secondary-soft text-xs font-medium">총 지출</p>
                    <p className="text-ink-900 text-base font-bold">{trip.totalAmount ?? '-'}</p>
                  </div>
                  <div className="flex w-[140px] flex-col items-end gap-0.5">
                    <p className="text-text-secondary-soft text-xs font-medium">1인당</p>
                    <p className="text-brand-blue text-base font-bold">{trip.perPersonAmount ?? '-'}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <TabBar />
    </MobileShell>
  );
};
