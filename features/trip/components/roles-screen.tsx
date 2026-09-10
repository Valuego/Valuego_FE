'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Avatar } from '@/shared/components/avatar';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { assignTripRole } from '@/shared/session';

import { rememberActiveTrip, useTripView } from '../trip.hooks';

type RolesScreenProps = {
  tripId: string;
};

export const RolesScreen = ({ tripId }: RolesScreenProps) => {
  const router = useRouter();
  const { trip, isLoading } = useTripView(tripId);

  useEffect(() => {
    rememberActiveTrip(tripId);
  }, [tripId]);

  useEffect(() => {
    if (!isLoading && !trip) {
      router.replace('/home');
    }
  }, [isLoading, router, trip]);

  if (isLoading || !trip) {
    return (
      <MobileShell className="bg-surface-gray">
        <div className="flex flex-1 items-center justify-center text-sm text-[rgba(55,56,60,0.61)]">
          역할을 불러오는 중…
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-3 pb-8">
        <Header title="역할 분담" onBack={() => router.push(`/trips/${tripId}`)} />
        <p className="text-text-secondary-soft text-sm font-medium">관심 있는 역할을 눌러 담당자를 바꿔요.</p>

        <ul className="flex flex-col gap-3">
          {trip.roles.map((role) => (
            <li key={role.id} className="border-line-hairline rounded-2xl border bg-white p-[18px]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-ink-900 text-base font-bold">{role.title}</p>
                  <p className="text-text-secondary-soft mt-1 text-[12.5px] font-medium">{role.description}</p>
                </div>
                <p className="text-brand-blue text-sm font-bold">{role.assigneeName ?? '미정'}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {trip.members.map((member) => {
                  const selected = role.assigneeId === member.id;
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => assignTripRole(tripId, role.id, selected ? null : member.id)}
                      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-bold ${
                        selected ? 'bg-brand-blue text-white' : 'bg-surface-gray text-ink-900'
                      }`}
                    >
                      <Avatar member={member.member} size="sm" className="size-5 text-[9px]" />
                      {member.name}
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </MobileShell>
  );
};
