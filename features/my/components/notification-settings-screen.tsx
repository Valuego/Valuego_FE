'use client';

import { useState } from 'react';

import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { Toggle } from '@/shared/components/toggle';

const NOTIFICATION_SETTINGS = [
  {
    id: 'group',
    title: '그룹 활동 알림',
    description: '멤버의 투표·지출 소식',
    defaultChecked: true,
  },
  {
    id: 'vote',
    title: '투표 마감 알림',
    description: '마감 3시간 전 리마인드',
    defaultChecked: true,
  },
  {
    id: 'settle',
    title: '정산 요청 알림',
    description: '정산·송금 요청 시',
    defaultChecked: true,
  },
  {
    id: 'marketing',
    title: '마케팅 수신',
    description: '이벤트·혜택 소식',
    defaultChecked: false,
  },
] as const;

export const NotificationSettingsScreen = () => {
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATION_SETTINGS.map((item) => [item.id, item.defaultChecked])),
  );

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-4">
        <Header title="알림 설정" />
        <ul className="border-line-hairline overflow-hidden rounded-[18px] border bg-white">
          {NOTIFICATION_SETTINGS.map((item) => (
            <li key={item.id} className="flex h-[68px] items-center justify-between px-[18px]">
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="text-ink-900 text-[15px] font-bold">{item.title}</p>
                <p className="text-text-secondary-soft text-[12.5px] font-medium">{item.description}</p>
              </div>
              <Toggle
                checked={Boolean(checkedMap[item.id])}
                onCheckedChange={(checked) => setCheckedMap((prev) => ({ ...prev, [item.id]: checked }))}
              />
            </li>
          ))}
        </ul>
      </div>
    </MobileShell>
  );
};
