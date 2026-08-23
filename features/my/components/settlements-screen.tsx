import { ACTIVE_TRIP, PAST_TRIPS } from '@/features/home';
import { Avatar } from '@/shared/components/avatar';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';

const SETTLEMENTS = [ACTIVE_TRIP, ...PAST_TRIPS].map((trip) => ({
  ...trip,
  statusLabel: '정산 완료',
}));

export const SettlementsScreen = () => {
  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-4 pb-8">
        <Header title="지난 정산" />
        <ul className="flex flex-col gap-3.5">
          {SETTLEMENTS.map((trip) => (
            <li key={trip.id} className="border-line-hairline rounded-[18px] border bg-white px-5 py-[18px]">
              <div className="flex items-center gap-2">
                <p className="text-ink-900 text-lg font-bold">{trip.title}</p>
                <div className="flex flex-1 items-center">
                  {trip.members.map((member, index) => (
                    <Avatar
                      key={member}
                      member={member}
                      size="sm"
                      className={index === 0 ? '' : '-ml-2 ring-2 ring-white'}
                    />
                  ))}
                </div>
                <span className="bg-brand-success/10 text-brand-success rounded-full px-2.5 py-1 text-[11px] font-bold">
                  {trip.statusLabel}
                </span>
              </div>
              <p className="text-text-secondary-soft mt-2 text-xs font-medium">{trip.dateLabel}</p>
              <div className="bg-line-hairline my-3 h-px" />
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-text-secondary-soft text-sm">총 지출</p>
                  <p className="text-ink-900 text-[15px] font-bold">{trip.totalAmount}</p>
                </div>
                <div className="text-right">
                  <p className="text-text-secondary-soft text-xs">1인당</p>
                  <p className="text-ink-900 text-[15px] font-bold">{trip.perPersonAmount}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </MobileShell>
  );
};
