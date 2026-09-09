'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { enterGuestSession, setActiveTripId, upsertLocalTrip, useAppSession, useTripById } from '@/shared/session';

import type { CreateTripPayload, GuestJoinRequest, PlaceVoteStatus } from './trip.types';

import {
  confirmSchedule,
  createTripWithAiSchedule,
  generateAiSchedule,
  groupDetailQueryOptions,
  joinGroupAsGuest,
  myGroupsQueryOptions,
  placeCommentsQueryOptions,
  placeVoteQueryOptions,
  scheduleQueryOptions,
  togglePlaceVote,
  tripQueryKeys,
} from './trip.api';
import { groupToTrip, parseGroupId } from './trip.lib';

export const useMyGroupsQuery = (enabled = true) => {
  return useQuery({
    ...myGroupsQueryOptions,
    enabled,
  });
};

export const useGroupDetailQuery = (tripId: string, enabled = true) => {
  const groupId = parseGroupId(tripId) ?? 0;
  return useQuery({
    ...groupDetailQueryOptions(groupId),
    enabled: enabled && Number.isFinite(groupId) && groupId > 0,
  });
};

export const useScheduleQuery = (tripId: string) => {
  const groupId = parseGroupId(tripId) ?? 0;
  return useQuery(scheduleQueryOptions(groupId));
};

export const usePlaceVoteQuery = (placeId: number) => {
  return useQuery(placeVoteQueryOptions(placeId));
};

export const usePlaceCommentsQuery = (placeId: number) => {
  return useQuery(placeCommentsQueryOptions(placeId));
};

export const useTripView = (tripId: string) => {
  const session = useAppSession();
  const localTrip = useTripById(tripId);
  const groupId = parseGroupId(tripId);
  const groupQuery = useGroupDetailQuery(tripId, !session.isGuest);
  const tripFromGroup = groupQuery.data ? groupToTrip(groupQuery.data, { viewerIsGuest: session.isGuest }) : null;
  const trip = tripFromGroup
    ? {
        ...tripFromGroup,
        expenses: localTrip?.expenses?.length ? localTrip.expenses : tripFromGroup.expenses,
        timeline: localTrip?.timeline?.length ? localTrip.timeline : tripFromGroup.timeline,
        todos: localTrip?.todos?.length ? localTrip.todos : tripFromGroup.todos,
        roles: localTrip?.roles?.length ? localTrip.roles : tripFromGroup.roles,
        phase:
          localTrip?.phase === 'settling' || localTrip?.phase === 'settled' ? localTrip.phase : tripFromGroup.phase,
      }
    : localTrip;

  return {
    trip,
    group: groupQuery.data,
    groupId,
    isGuest: session.isGuest,
    isLoading: Boolean(groupId) && !session.isGuest && groupQuery.isPending,
    isError: Boolean(groupId) && !session.isGuest && groupQuery.isError && !localTrip,
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

export const useJoinGroupAsGuest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupLink, body }: { groupLink: string; body: GuestJoinRequest }) =>
      joinGroupAsGuest(groupLink, body),
    onSuccess: (result) => {
      queryClient.setQueryData(tripQueryKeys.detail(result.group.groupId), result.group);
      const trip = groupToTrip(result.group, { viewerIsGuest: true });
      enterGuestSession(trip);
    },
  });
};

export const useTogglePlaceVote = (placeId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (voteStatus: PlaceVoteStatus) => togglePlaceVote(placeId, voteStatus),
    onSuccess: (vote) => {
      queryClient.setQueryData(tripQueryKeys.vote(placeId), vote);
    },
  });
};

export const rememberActiveTrip = (tripId: string) => {
  setActiveTripId(tripId);
};
