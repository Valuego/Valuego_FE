'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';

import {
  consumePostLoginPath,
  enterGuestSession,
  setActiveTripId,
  upsertLocalTrip,
  useAppSession,
  useTripById,
} from '@/shared/session';

import type {
  AiScheduleSuggestion,
  CreateCommentRequest,
  CreateEffortItemRequest,
  CreateEffortRequest,
  CreateExpenseRequest,
  CreatePlaceRequest,
  GroupCreateRequest,
  GroupInfo,
  GuestJoinRequest,
  PlaceVoteStatus,
  StyleCreateRequest,
  UpdatePlaceRequest,
} from './trip.types';

import {
  applyAiScheduleUpdate,
  confirmSchedule,
  confirmSettlement,
  createCustomPlace,
  createEffort,
  createEffortItem,
  createExpense,
  createGroup,
  createGuestStyle,
  createLeaderStyle,
  createPlaceComment,
  deleteEffortItem,
  deletePlace,
  effortItemsQueryOptions,
  effortResultQueryOptions,
  expensesQueryOptions,
  generateAiSchedule,
  getSchedule,
  groupDetailQueryOptions,
  groupSummaryQueryOptions,
  joinGroupAsGuest,
  leaderGroupListQueryOptions,
  myGroupsQueryOptions,
  pastSettlementsQueryOptions,
  placeBlogReviewsQueryOptions,
  placeCommentsQueryOptions,
  placeVoteQueryOptions,
  remainingScheduleQueryOptions,
  settlementQueryOptions,
  settlementRecapQueryOptions,
  styleCardQueryOptions,
  suggestAiScheduleUpdate,
  togglePlaceVote,
  tripQueryKeys,
  updatePlace,
  userTimelineQueryOptions,
} from './trip.api';
import { LOCAL_DEMO_SCHEDULE } from './trip.constants';
import {
  decodeTripId,
  groupToTrip,
  isGuestViewerOfGroup,
  MEMBER_COLOR_TO_KEY,
  mergeTripWithLocal,
  parseGroupId,
} from './trip.lib';

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

export const useGroupSummaryQuery = (groupLink: string, enabled = true) => {
  return useQuery({
    ...groupSummaryQueryOptions(groupLink),
    enabled: enabled && Boolean(groupLink),
  });
};

export const useScheduleQuery = (tripId: string, options?: { refetchInterval?: number | false; enabled?: boolean }) => {
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
    enabled: Boolean(tripId) && (options?.enabled ?? true),
    retry: 0,
    throwOnError: false,
    refetchInterval: options?.refetchInterval,
  });
};

export const usePlaceVoteQuery = (placeId: number) => {
  return useQuery(placeVoteQueryOptions(placeId));
};

export const usePlaceCommentsQuery = (placeId: number) => {
  return useQuery(placeCommentsQueryOptions(placeId));
};

export const usePlaceBlogReviewsQuery = (placeId: number) => {
  return useQuery(placeBlogReviewsQueryOptions(placeId));
};

export const useLeaderGroupListQuery = (enabled = true) => {
  return useQuery({ ...leaderGroupListQueryOptions, enabled });
};

export const useStyleCardQuery = (tripId: string, enabled = true) => {
  const groupId = parseGroupId(tripId) ?? 0;
  return useQuery({
    ...styleCardQueryOptions(groupId),
    enabled: enabled && Number.isFinite(groupId) && groupId > 0,
  });
};

export const useUserTimelineQuery = (tripId: string, enabled = true) => {
  const groupId = parseGroupId(tripId) ?? 0;
  return useQuery({
    ...userTimelineQueryOptions(groupId),
    enabled: enabled && Number.isFinite(groupId) && groupId > 0,
  });
};

export const useRemainingScheduleQuery = (tripId: string, enabled = true) => {
  const groupId = parseGroupId(tripId) ?? 0;
  return useQuery({
    ...remainingScheduleQueryOptions(groupId),
    enabled: enabled && Number.isFinite(groupId) && groupId > 0,
  });
};

export const useEffortItemsQuery = (groupId: number, enabled = true) => {
  return useQuery({
    ...effortItemsQueryOptions(groupId),
    enabled: enabled && Number.isFinite(groupId) && groupId > 0,
  });
};

export const useEffortResultQuery = (groupId: number, targetMemberId: number, enabled = true) => {
  return useQuery({
    ...effortResultQueryOptions(groupId, targetMemberId),
    enabled:
      enabled && Number.isFinite(groupId) && groupId > 0 && Number.isFinite(targetMemberId) && targetMemberId > 0,
  });
};

export const useExpensesQuery = (groupId: number, enabled = true) => {
  return useQuery({
    ...expensesQueryOptions(groupId),
    enabled: enabled && Number.isFinite(groupId) && groupId > 0,
  });
};

export const useSettlementQuery = (groupId: number, enabled = true) => {
  return useQuery({
    ...settlementQueryOptions(groupId),
    enabled: enabled && Number.isFinite(groupId) && groupId > 0,
  });
};

export const useSettlementRecapQuery = (groupId: number, enabled = true) => {
  return useQuery({
    ...settlementRecapQueryOptions(groupId),
    enabled: enabled && Number.isFinite(groupId) && groupId > 0,
  });
};

export const usePastSettlementsQuery = (enabled = true) => {
  return useQuery({ ...pastSettlementsQueryOptions, enabled });
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
  const groupQuery = useGroupDetailQuery(tripId, Boolean(groupId), options?.refetchInterval);
  const listQuery = useMyGroupsQuery(session.isAuthenticated || !session.isGuest);
  const groupFromList = useMemo(() => {
    const groups = [...(listQuery.data?.ongoingGroups ?? []), ...(listQuery.data?.pastGroups ?? [])];
    return findGroupByTripId(groups, tripId);
  }, [listQuery.data, tripId]);
  const resolvedGroup = groupQuery.data ?? groupFromList;
  const isGuestViewer = isGuestViewerOfGroup(resolvedGroup, {
    isGuestSession: session.isGuest,
    isAuthenticated: session.isAuthenticated,
    guestMemberId: session.guestMemberId,
  });
  const tripFromGroup = useMemo(
    () =>
      resolvedGroup
        ? groupToTrip(resolvedGroup, {
            viewerIsGuest: isGuestViewer,
            viewerMemberId: session.guestMemberId,
          })
        : null,
    [isGuestViewer, resolvedGroup, session.guestMemberId],
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

  const waitingForRemote = Boolean(groupId) && groupQuery.isPending && !trip;

  return {
    trip,
    group: resolvedGroup,
    groupId,
    isGuest: isGuestViewer,
    isLoading: waitingForRemote,
    isError: Boolean(groupId) && groupQuery.isError && !trip,
    error: groupQuery.error,
    refetch: groupQuery.refetch,
  };
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: GroupCreateRequest) => createGroup(body),
    onSuccess: async (group) => {
      consumePostLoginPath();
      queryClient.setQueryData(tripQueryKeys.detail(group.groupId), group);
      await queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
      upsertLocalTrip(groupToTrip(group));
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

export const useSuggestAiScheduleUpdate = (groupId: number) => {
  return useMutation({
    mutationFn: (input: { dayNum: number; prompt: string }) => suggestAiScheduleUpdate({ groupId, ...input }),
  });
};

export const useApplyAiScheduleUpdate = (groupId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (suggestion: AiScheduleSuggestion) => applyAiScheduleUpdate(groupId, suggestion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.schedule(groupId) });
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

export const useCreatePlace = (groupId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreatePlaceRequest) => createCustomPlace(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.schedule(groupId) });
    },
  });
};

export const useUpdatePlace = (groupId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ travelPlaceId, body }: { travelPlaceId: number; body: UpdatePlaceRequest }) =>
      updatePlace(travelPlaceId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.schedule(groupId) });
    },
  });
};

export const useDeletePlace = (groupId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (travelPlaceId: number) => deletePlace(travelPlaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.schedule(groupId) });
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
      await queryClient.invalidateQueries({ queryKey: tripQueryKeys.styleCard(groupId) });
    },
  });
};

export const useCreateGuestStyle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: StyleCreateRequest) => createGuestStyle(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tripQueryKeys.details() });
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
      const trip = groupToTrip(result.group, {
        viewerIsGuest: true,
        viewerMemberId: result.groupMemberId,
      });
      enterGuestSession(trip, {
        name: result.memberName,
        member: MEMBER_COLOR_TO_KEY[result.memberColor],
        guestMemberId: result.groupMemberId,
      });
    },
  });
};

export const useCreatePlaceComment = (placeId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateCommentRequest) => createPlaceComment(placeId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.comment(placeId) });
    },
  });
};

export const useCreateEffortItem = (groupId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateEffortItemRequest) => createEffortItem(groupId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.effortItemsForGroup(groupId) });
    },
  });
};

export const useDeleteEffortItem = (groupId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (effortItemId: number) => deleteEffortItem(groupId, effortItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.effortItemsForGroup(groupId) });
    },
  });
};

export const useCreateEffort = () => {
  return useMutation({
    mutationFn: (body: CreateEffortRequest) => createEffort(body),
  });
};

export const useCreateExpense = (groupId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateExpenseRequest) => createExpense(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.expensesForGroup(groupId) });
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.settlement(groupId) });
    },
  });
};

export const useConfirmSettlement = (groupId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => confirmSettlement(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.settlement(groupId) });
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
