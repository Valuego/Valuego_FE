'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';

import { enterGuestSession, setActiveTripId, upsertLocalTrip, useAppSession, useTripById } from '@/shared/session';

import type { CreateTripPayload, GroupInfo, GuestJoinRequest, PlaceVoteStatus, StyleCreateRequest } from './trip.types';

import {
  confirmSchedule,
  createGuestStyle,
  createLeaderStyle,
  createTripWithAiSchedule,
  generateAiSchedule,
  getSchedule,
  groupDetailQueryOptions,
  joinGroupAsGuest,
  myGroupsQueryOptions,
  placeCommentsQueryOptions,
  placeVoteQueryOptions,
  togglePlaceVote,
  tripQueryKeys,
} from './trip.api';
import { LOCAL_DEMO_SCHEDULE } from './trip.constants';
import { decodeTripId, groupToTrip, mergeTripWithLocal, parseGroupId } from './trip.lib';

export const useMyGroupsQuery = (enabled = true) => {
  return useQuery({
    ...myGroupsQueryOptions,
    enabled,
  });
};

export const useGroupDetailQuery = (tripId: string, enabled = true, refetchInterval?: number | false) => {
  const groupId = parseGroupId(tripId) ?? 0;
  return useQuery({
    ...groupDetailQueryOptions(groupId),
    enabled: enabled && Number.isFinite(groupId) && groupId > 0,
    refetchInterval,
  });
};

export const useScheduleQuery = (tripId: string) => {
  const groupId = parseGroupId(tripId) ?? 0;
  const isRemote = groupId > 0;
  return useQuery({
    queryKey: isRemote ? tripQueryKeys.schedule(groupId) : (['trips', 'schedule', 'local', tripId] as const),
    queryFn: async () => {
      if (isRemote) {
        return getSchedule(groupId);
      }
      return LOCAL_DEMO_SCHEDULE;
    },
    retry: 0,
    throwOnError: false,
  });
};

export const usePlaceVoteQuery = (placeId: number) => {
  return useQuery(placeVoteQueryOptions(placeId));
};

export const usePlaceCommentsQuery = (placeId: number) => {
  return useQuery(placeCommentsQueryOptions(placeId));
};

const findGroupByTripId = (groups: GroupInfo[] | undefined, tripId: string) => {
  if (!groups?.length) {
    return null;
  }
  const decoded = decodeTripId(tripId);
  return (
    groups.find(
      (group) =>
        String(group.groupId) === tripId ||
        String(group.groupId) === decoded ||
        group.groupLink === tripId ||
        group.groupLink === decoded,
    ) ?? null
  );
};

export const useTripView = (tripId: string, options?: { refetchInterval?: number | false }) => {
  const session = useAppSession();
  const localTrip = useTripById(tripId);
  const groupId = parseGroupId(tripId);
  const groupQuery = useGroupDetailQuery(tripId, !session.isGuest, options?.refetchInterval);
  const listQuery = useMyGroupsQuery(!session.isGuest);
  const groupFromList = useMemo(() => {
    const groups = [...(listQuery.data?.ongoingGroups ?? []), ...(listQuery.data?.pastGroups ?? [])];
    return findGroupByTripId(groups, tripId);
  }, [listQuery.data, tripId]);
  const resolvedGroup = groupQuery.data ?? groupFromList;
  const tripFromGroup = useMemo(
    () => (resolvedGroup ? groupToTrip(resolvedGroup, { viewerIsGuest: session.isGuest }) : null),
    [resolvedGroup, session.isGuest],
  );
  const trip = useMemo(
    () => (tripFromGroup ? mergeTripWithLocal(tripFromGroup, localTrip) : localTrip),
    [localTrip, tripFromGroup],
  );
  const persistedKey = trip ? `${trip.id}:${trip.phase}` : null;
  const persistedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!trip || persistedRef.current === persistedKey) {
      return;
    }
    persistedRef.current = persistedKey;
    upsertLocalTrip(trip);
  }, [persistedKey, trip]);

  const waitingForRemote = Boolean(groupId) && !session.isGuest && groupQuery.isPending && listQuery.isPending && !trip;

  return {
    trip,
    group: resolvedGroup,
    groupId,
    isGuest: session.isGuest,
    isLoading: waitingForRemote,
    isError: Boolean(groupId) && !session.isGuest && groupQuery.isError && !trip,
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

export const useCreateLeaderStyle = (groupId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: StyleCreateRequest) => createLeaderStyle(groupId, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tripQueryKeys.detail(groupId) });
      await queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
    },
  });
};

export const useCreateGuestStyle = () => {
  return useMutation({
    mutationFn: (body: StyleCreateRequest) => createGuestStyle(body),
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
