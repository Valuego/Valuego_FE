'use client';

import { useUpdateNotificationAgree, useUserProfileQuery } from '@/features/auth';
import { Header } from '@/shared/components/header';
import { MobileShell } from '@/shared/components/mobile-shell';
import { TabBar } from '@/shared/components/tab-bar';
import { Toggle } from '@/shared/components/toggle';
import { getErrorMessage } from '@/shared/lib/api';
import type { NotificationAgree } from '@/shared/session';

const NOTIFICATION_SETTINGS = [
  {
    id: 'notifyComments',
    title: '그룹 활동 알림',
    description: '멤버의 투표·지출 소식',
  },
  {
    id: 'notifyReminders',
    title: '리마인드 알림',
    description: '일정·참여 리마인드',
  },
  {
    id: 'notifySettlement',
    title: '정산 요청 알림',
    description: '정산·송금 요청 시',
  },
  {
    id: 'notifyMarketing',
    title: '마케팅 수신',
    description: '이벤트·혜택 소식',
  },
] as const;

const DEFAULT_AGREE: NotificationAgree = {
  notifyComments: true,
  notifyReminders: true,
  notifySettlement: true,
  notifyMarketing: true,
};

export const NotificationSettingsScreen = () => {
  const profileQuery = useUserProfileQuery();
  const updateAgree = useUpdateNotificationAgree();
  const checkedMap = profileQuery.data?.notificationAgree ?? DEFAULT_AGREE;

  const handleToggle = (key: keyof NotificationAgree, checked: boolean) => {
    void updateAgree.mutateAsync({ ...checkedMap, [key]: checked });
  };

  return (
    <MobileShell className="bg-surface-gray">
      <div className="flex flex-1 flex-col gap-4 px-5 pt-4 pb-4">
        <Header title="알림 설정" />
        {updateAgree.isError ? (
          <p className="text-sm font-medium text-[#e08300]">{getErrorMessage(updateAgree.error)}</p>
        ) : null}
        <ul className="border-line-hairline overflow-hidden rounded-[18px] border bg-white">
          {NOTIFICATION_SETTINGS.map((item, index) => (
            <li
              key={item.id}
              className={`flex h-[68px] items-center justify-between px-[18px] ${
                index < NOTIFICATION_SETTINGS.length - 1 ? 'border-line-hairline border-b' : ''
              }`}
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="text-ink-900 text-[15px] font-bold">{item.title}</p>
                <p className="text-text-secondary-soft text-[12.5px] font-medium">{item.description}</p>
              </div>
              <Toggle
                checked={Boolean(checkedMap[item.id])}
                onCheckedChange={(checked) => {
                  handleToggle(item.id, checked);
                }}
              />
            </li>
          ))}
        </ul>
      </div>
      <TabBar />
    </MobileShell>
  );
};
