'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Avatar } from '@/shared/components/avatar';
import { Button } from '@/shared/components/button';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { TextField } from '@/shared/components/text-field';
import { getErrorMessage } from '@/shared/lib/api';
import { cn } from '@/shared/lib/cn';

import { useCreateEffortItem, useDeleteEffortItem, useEffortItemsQuery, useTripView } from '../trip.hooks';
import { buildTripHref, parseGroupId } from '../trip.lib';

type LaborReviewScreenProps = {
  tripId: string;
};

export const LaborReviewScreen = ({ tripId }: LaborReviewScreenProps) => {
  const router = useRouter();
  const groupId = parseGroupId(tripId) ?? 0;
  const { trip, isLoading: tripLoading } = useTripView(tripId);
  const itemsQuery = useEffortItemsQuery(groupId);
  const createItem = useCreateEffortItem(groupId);
  const deleteItem = useDeleteEffortItem(groupId);
  const [adding, setAdding] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<Record<number, number | null>>({});

  const items = itemsQuery.data ?? [];

  if (tripLoading || !trip || !groupId) {
    return (
      <MobileShell className="bg-surface-gray">
        <div className="flex flex-1 items-center justify-center text-sm text-[rgba(55,56,60,0.61)]">
          수고 기록을 불러오는 중…
        </div>
      </MobileShell>
    );
  }

  const canContinue = items.length > 0 && items.every((item) => assignments[item.effortItemId]);

  const handleAdd = async () => {
    if (!customTitle.trim()) {
      return;
    }
    try {
      await createItem.mutateAsync({ itemCategory: 'ETC', title: customTitle.trim() });
      setCustomTitle('');
      setAdding(false);
    } catch {
      // 에러 메시지는 아래 createItem.isError 영역에서 그대로 보여준다.
    }
  };

  const handleContinue = () => {
    const picks = items
      .map((item) => ({ itemId: item.effortItemId, memberId: assignments[item.effortItemId] }))
      .filter((pick): pick is { itemId: number; memberId: number } => Boolean(pick.memberId));
    const encoded = encodeURIComponent(JSON.stringify(picks));
    router.push(`${buildTripHref(tripId, 'settlement', 'values')}?picks=${encoded}`);
  };

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-2.5 px-5 pt-3 pb-28">
        <Header title="수고 기록" onBack={() => router.push(`/trips/${tripId}/settlement`)} />
        <div className="pb-1">
          <h2 className="text-ink-900 text-xl font-bold tracking-[-0.5px]">누가 가장 수고했나요?</h2>
          <p className="text-text-secondary-soft mt-1 text-[13px] font-medium">항목마다 떠오르는 친구를 골라주세요.</p>
        </div>

        {itemsQuery.isPending ? (
          <p className="text-text-secondary-soft text-sm font-medium">항목을 불러오는 중…</p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {items.map((item) => (
              <li
                key={item.effortItemId}
                className="border-line-hairline relative rounded-[14px] border bg-white px-[18px] py-4"
              >
                <div className="flex items-center gap-3">
                  <p className="text-ink-900 w-[72px] shrink-0 text-base font-bold tracking-[-0.2px]">{item.title}</p>
                  <div className="flex min-w-0 flex-1 gap-1.5">
                    {trip.members.map((member) => {
                      const selected = assignments[item.effortItemId] === Number(member.id);
                      return (
                        <button
                          key={member.id}
                          type="button"
                          aria-pressed={selected}
                          className={cn('rounded-full', selected ? 'opacity-100' : 'opacity-30')}
                          onClick={() =>
                            setAssignments((current) => ({ ...current, [item.effortItemId]: Number(member.id) }))
                          }
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
                  {item.isCustom ? (
                    <button
                      type="button"
                      aria-label={`${item.title} 메뉴`}
                      className="text-text-secondary-soft px-1 text-lg font-bold"
                      onClick={() =>
                        setOpenMenuId((current) => (current === item.effortItemId ? null : item.effortItemId))
                      }
                    >
                      ⋮
                    </button>
                  ) : null}
                </div>
                {openMenuId === item.effortItemId ? (
                  <button
                    type="button"
                    className="border-line-hairline absolute top-2 right-10 rounded-lg border bg-white px-4 py-2 text-sm font-medium shadow-[0px_4px_12px_rgba(23,23,25,0.12)]"
                    onClick={() => {
                      deleteItem.mutate(item.effortItemId);
                      setOpenMenuId(null);
                    }}
                  >
                    삭제
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        {adding ? (
          <div className="flex flex-col gap-2">
            <TextField
              label="항목 이름"
              value={customTitle}
              placeholder="예: 요리"
              onChange={(event) => setCustomTitle(event.target.value)}
            />
            <Button
              variant="primary"
              fullWidth
              disabled={!customTitle.trim() || createItem.isPending}
              onClick={() => void handleAdd()}
            >
              {createItem.isPending ? '추가하는 중…' : '추가하기'}
            </Button>
            {createItem.isError ? (
              <p className="text-sm font-medium text-[#e08300]">{getErrorMessage(createItem.error)}</p>
            ) : null}
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
        <Button variant="primary" fullWidth disabled={!canContinue} onClick={handleContinue}>
          수고 가치 입력하기
        </Button>
      </div>
    </MobileShell>
  );
};
