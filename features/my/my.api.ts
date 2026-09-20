import { queryOptions } from '@tanstack/react-query';

import { apiRequest } from '@/shared/lib/api';

import { notificationListSchema, notificationSchema } from './my.schemas';

export const myQueryKeys = {
  all: () => ['my'] as const,
  notifications: () => [...myQueryKeys.all(), 'notifications'] as const,
};

export const getNotifications = async () => {
  const data = await apiRequest<unknown>('/notifications');
  return notificationListSchema.parse(data ?? []);
};

export const readNotification = async (notificationId: number) => {
  const data = await apiRequest<unknown>(`/notifications/${notificationId}/read`, { method: 'PATCH' });
  return notificationSchema.parse(data);
};

export const notificationsQueryOptions = queryOptions({
  queryKey: myQueryKeys.notifications(),
  queryFn: getNotifications,
  retry: 0,
  throwOnError: false,
});
