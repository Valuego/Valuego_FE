import { queryOptions } from '@tanstack/react-query';

import { apiRequest, isApiError } from '@/shared/lib/api';

import type {
  CreateTripPayload,
  GroupCreateRequest,
  GroupInfo,
  GroupList,
  GuestJoinRequest,
  GuestJoinResult,
  PlaceCommentList,
  PlaceVote,
  PlaceVoteStatus,
  StyleCreateRequest,
  StyleInfo,
  TravelSchedule,
} from './trip.types';

import { toCreateGroupRequest, toCreateStyleRequest } from './trip.lib';
import {
  groupInfoSchema,
  groupListSchema,
  guestJoinResultSchema,
  placeCommentListSchema,
  placeVoteSchema,
  styleInfoSchema,
  travelScheduleSchema,
} from './trip.schemas';

export const AI_SCHEDULE_TIMEOUT_MS = 120_000;

export const tripQueryKeys = {
  all: () => ['trips'] as const,
  lists: () => [...tripQueryKeys.all(), 'list'] as const,
  details: () => [...tripQueryKeys.all(), 'detail'] as const,
  detail: (groupId: number) => [...tripQueryKeys.details(), groupId] as const,
  schedules: () => [...tripQueryKeys.all(), 'schedule'] as const,
  schedule: (groupId: number) => [...tripQueryKeys.schedules(), groupId] as const,
  votes: () => [...tripQueryKeys.all(), 'vote'] as const,
  vote: (placeId: number) => [...tripQueryKeys.votes(), placeId] as const,
  comments: () => [...tripQueryKeys.all(), 'comment'] as const,
  comment: (placeId: number) => [...tripQueryKeys.comments(), placeId] as const,
};

export const joinGroupAsGuest = async (groupLink: string, body: GuestJoinRequest): Promise<GuestJoinResult> => {
  const data = await apiRequest<GuestJoinResult>(`/groups/invite?groupLink=${encodeURIComponent(groupLink)}`, {
    method: 'POST',
    body,
    skipAuthRetry: true,
  });
  return guestJoinResultSchema.parse(data);
};

export const getMyGroups = async (): Promise<GroupList> => {
  const data = await apiRequest<GroupList>('/groups/all');
  return groupListSchema.parse(data);
};

export const getGroupDetail = async (groupId: number): Promise<GroupInfo> => {
  const data = await apiRequest<GroupInfo>(`/groups?groupId=${groupId}`);
  return groupInfoSchema.parse(data);
};

export const createGroup = async (body: GroupCreateRequest): Promise<GroupInfo> => {
  const data = await apiRequest<GroupInfo>('/groups', { method: 'POST', body });
  return groupInfoSchema.parse(data);
};

export const createLeaderStyle = async (groupId: number, body: StyleCreateRequest): Promise<StyleInfo> => {
  const data = await apiRequest<StyleInfo>(`/groups/styles?groupId=${groupId}`, {
    method: 'POST',
    body,
  });
  return styleInfoSchema.parse(data);
};

export const createGuestStyle = async (body: StyleCreateRequest): Promise<StyleInfo> => {
  const data = await apiRequest<StyleInfo>('/groups/styles/guest', {
    method: 'POST',
    body,
    skipAuthRetry: true,
  });
  return styleInfoSchema.parse(data);
};

export const generateAiSchedule = async (groupId: number): Promise<TravelSchedule> => {
  const data = await apiRequest<TravelSchedule>(`/schedules/ai?groupId=${groupId}`, {
    method: 'POST',
    signal: AbortSignal.timeout(AI_SCHEDULE_TIMEOUT_MS),
  });
  return travelScheduleSchema.parse(data);
};

export const getSchedule = async (groupId: number): Promise<TravelSchedule> => {
  const data = await apiRequest<TravelSchedule>(`/schedules/all?groupId=${groupId}`);
  return travelScheduleSchema.parse(data);
};

export const confirmSchedule = async (groupId: number) => {
  await apiRequest(`/schedules/confirm?groupId=${groupId}`, { method: 'PATCH' });
};

export const getPlaceVote = async (travelPlaceId: number): Promise<PlaceVote> => {
  const data = await apiRequest<PlaceVote>(`/places/vote?travelPlaceId=${travelPlaceId}`);
  return placeVoteSchema.parse(data);
};

export const togglePlaceVote = async (travelPlaceId: number, voteStatus: PlaceVoteStatus): Promise<PlaceVote> => {
  const data = await apiRequest<PlaceVote>(`/places/vote?travelPlaceId=${travelPlaceId}`, {
    method: 'POST',
    body: { voteStatus },
  });
  return placeVoteSchema.parse(data);
};

export const getPlaceComments = async (travelPlaceId: number): Promise<PlaceCommentList> => {
  const data = await apiRequest<PlaceCommentList>(`/comments?travelPlaceId=${travelPlaceId}`);
  return placeCommentListSchema.parse(data);
};

export const createGroupWithStyle = async (payload: CreateTripPayload): Promise<GroupInfo> => {
  const group = await createGroup(toCreateGroupRequest(payload));
  try {
    await createLeaderStyle(group.groupId, toCreateStyleRequest(payload));
  } catch (error) {
    const alreadyExists = isApiError(error) && error.errorData?.code === 'STYLE-001';
    if (!alreadyExists) {
      throw error;
    }
  }
  return group;
};

export const createTripWithAiSchedule = async (payload: CreateTripPayload) => {
  const group = await createGroupWithStyle(payload);
  try {
    const schedule = await generateAiSchedule(group.groupId);
    return { group, schedule };
  } catch {
    return { group, schedule: null };
  }
};

export const myGroupsQueryOptions = queryOptions({
  queryKey: tripQueryKeys.lists(),
  queryFn: getMyGroups,
  retry: 0,
  throwOnError: false,
});

export const groupDetailQueryOptions = (groupId: number) =>
  queryOptions({
    queryKey: tripQueryKeys.detail(groupId),
    queryFn: () => getGroupDetail(groupId),
    enabled: Number.isFinite(groupId) && groupId > 0,
    retry: 0,
    throwOnError: false,
  });

export const scheduleQueryOptions = (groupId: number) =>
  queryOptions({
    queryKey: tripQueryKeys.schedule(groupId),
    queryFn: () => getSchedule(groupId),
    enabled: Number.isFinite(groupId) && groupId > 0,
    retry: 0,
    throwOnError: false,
  });

export const placeVoteQueryOptions = (placeId: number) =>
  queryOptions({
    queryKey: tripQueryKeys.vote(placeId),
    queryFn: () => getPlaceVote(placeId),
    enabled: Number.isFinite(placeId) && placeId > 0,
    retry: 0,
    throwOnError: false,
  });

export const placeCommentsQueryOptions = (placeId: number) =>
  queryOptions({
    queryKey: tripQueryKeys.comment(placeId),
    queryFn: () => getPlaceComments(placeId),
    enabled: Number.isFinite(placeId) && placeId > 0,
    retry: 0,
    throwOnError: false,
  });
