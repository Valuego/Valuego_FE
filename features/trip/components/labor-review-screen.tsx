'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Avatar } from '@/shared/components/avatar';
import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { TextField } from '@/shared/components/text-field';
import { cn } from '@/shared/lib/cn';
import { addLaborCategory, assignLaborMember, removeLaborCategory } from '@/shared/session';

import { rememberActiveTrip, useTripView } from '../trip.hooks';

type LaborReviewScreenProps = {
  tripId: string;
};

export const LaborReviewScreen = ({ tripId }: LaborReviewScreenProps) => {
  const router = useRouter();
  const { trip, isLoading } = useTripView(tripId);
  const [adding, setAdding] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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
          수고 기록을 불러오는 중…
        </div>
      </MobileShell>
    );
  }

  const canContinue = trip.laborCategories.length > 0 && trip.laborCategories.every((item) => item.assigneeId);

  const handleAdd = () => {
    addLaborCategory(tripId, customTitle);
    setCustomTitle('');
    setAdding(false);
  };

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-2.5 px-5 pt-3 pb-28">
        <Header title="수고 기록" onBack={() => router.push(`/trips/${tripId}/settlement`)} />
        <div className="pb-1">
          <h2 className="text-ink-900 text-xl font-bold tracking-[-0.5px]">누가 가장 수고했나요?</h2>
          <p className="text-text-secondary-soft mt-1 text-[13px] font-medium">항목마다 떠오르는 친구를 골라주세요.</p>
        </div>

        <ul className="flex flex-col gap-2.5">
          {trip.laborCategories.map((category) => (
            <li
              key={category.id}
              className="border-line-hairline relative rounded-[14px] border bg-white px-[18px] py-4"
            >
              <div className="flex items-center gap-3">
                <p className="text-ink-900 w-[72px] shrink-0 text-base font-bold tracking-[-0.2px]">{category.title}</p>
                <div className="flex min-w-0 flex-1 gap-1.5">
                  {trip.members.map((member) => {
                    const selected = category.assigneeId === member.id;
                    return (
                      <button
                        key={member.id}
                        type="button"
                        aria-pressed={selected}
                        className={cn('rounded-full', selected ? 'opacity-100' : 'opacity-30')}
                        onClick={() => assignLaborMember(tripId, category.id, member.id)}
                      >
                        <Avatar
                          member={member.member}
                          size="sm"
                          initial={member.name.slice(0, 1)}
                          className="size-[38px] text-sm"
                        />
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  aria-label={`${category.title} 메뉴`}
                  className="text-text-secondary-soft px-1 text-lg font-bold"
                  onClick={() => setOpenMenuId((current) => (current === category.id ? null : category.id))}
                >
                  ⋮
                </button>
              </div>
              {openMenuId === category.id ? (
                <button
                  type="button"
                  className="border-line-hairline absolute top-2 right-10 rounded-lg border bg-white px-4 py-2 text-sm font-medium shadow-[0px_4px_12px_rgba(23,23,25,0.12)]"
                  onClick={() => {
                    removeLaborCategory(tripId, category.id);
                    setOpenMenuId(null);
                  }}
                >
                  삭제
                </button>
              ) : null}
            </li>
          ))}
        </ul>

        {adding ? (
          <div className="flex flex-col gap-2">
            <TextField
              label="항목 이름"
              value={customTitle}
              placeholder="예: 요리"
              onChange={(event) => setCustomTitle(event.target.value)}
            />
            <Button variant="primary" fullWidth disabled={!customTitle.trim()} onClick={handleAdd}>
              추가하기
            </Button>
          </div>
        ) : (
          <button
            type="button"
            className="rounded-[14px] border border-[#4164ff] bg-[#edf0fa] px-3.5 py-3 text-center text-[14.5px] font-bold text-[#3366ff]"
            onClick={() => setAdding(true)}
          >
            + 직접 추가
          </button>
        )}
      </div>
      <div className="bg-surface-gray fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[430px] px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <Button
          variant="primary"
          fullWidth
          disabled={!canContinue}
          onClick={() => router.push(`/trips/${tripId}/settlement/values`)}
        >
          수고 가치 입력하기
        </Button>
      </div>
    </MobileShell>
  );
};
