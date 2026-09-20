import { useQuery } from '@tanstack/react-query';

import { notificationsQueryOptions } from './my.api';

export const useNotificationsQuery = (enabled = true) => {
  return useQuery({
    ...notificationsQueryOptions,
    enabled,
  });
};
