'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { setActiveTripId, upsertLocalTrip, useTripById } from '@/shared/session';

import type { CreateTripPayload } from './trip.types';

import {
  confirmSchedule,
  createTripWithAiSchedule,
  generateAiSchedule,
  groupDetailQueryOptions,
  myGroupsQueryOptions,
  scheduleQueryOptions,
  tripQueryKeys,
} from './trip.api';
import { groupToTrip, parseGroupId } from './trip.lib';

export const useMyGroupsQuery = () => {
  return useQuery(myGroupsQueryOptions);
};

export const useGroupDetailQuery = (tripId: string) => {
  const groupId = parseGroupId(tripId) ?? 0;
  return useQuery(groupDetailQueryOptions(groupId));
};

export const useScheduleQuery = (tripId: string) => {
  const groupId = parseGroupId(tripId) ?? 0;
  return useQuery(scheduleQueryOptions(groupId));
};

export const useTripView = (tripId: string) => {
  const localTrip = useTripById(tripId);
  const groupQuery = useGroupDetailQuery(tripId);
  const groupId = parseGroupId(tripId);
  const trip = groupQuery.data ? groupToTrip(groupQuery.data) : groupId ? null : localTrip;

  return {
    trip,
    group: groupQuery.data,
    groupId,
    isLoading: Boolean(groupId) && groupQuery.isPending,
    isError: Boolean(groupId) && groupQuery.isError,
    error: groupQuery.error,
    refetch: groupQuery.refetch,
  };
};

export const useCreateTripWithAiSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTripPayload) => createTripWithAiSchedule(payload),
    onSuccess: async ({ group, schedule }) => {
      queryClient.setQueryData(tripQueryKeys.detail(group.groupId), group);
      if (schedule) {
        queryClient.setQueryData(tripQueryKeys.schedule(group.groupId), schedule);
      }
      await queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
      const trip = groupToTrip(group);
      upsertLocalTrip(trip);
    },
  });
};

export const useGenerateAiSchedule = (groupId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => generateAiSchedule(groupId),
    onSuccess: (schedule) => {
      queryClient.setQueryData(tripQueryKeys.schedule(groupId), schedule);
    },
  });
};

export const useConfirmSchedule = (groupId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => confirmSchedule(groupId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tripQueryKeys.detail(groupId) });
      await queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
    },
  });
};

export const rememberActiveTrip = (tripId: string) => {
  setActiveTripId(tripId);
};
