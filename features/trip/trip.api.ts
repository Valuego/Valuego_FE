import { queryOptions } from '@tanstack/react-query';

import { apiRequest } from '@/shared/lib/api';

import type {
  CreateCommentRequest,
  CreateEffortItemRequest,
  CreateEffortRequest,
  CreateExpenseRequest,
  CreatePlaceRequest,
  EffortItem,
  EffortResult,
  ExpenseInfo,
  ExpenseList,
  GroupCreateRequest,
  GroupInfo,
  GroupList,
  GuestJoinRequest,
  GuestJoinResult,
  LeaderGroupSummary,
  MyStyleCard,
  PastSettlement,
  PlaceBlogReviews,
  PlaceComment,
  PlaceCommentList,
  PlaceVote,
  PlaceVoteStatus,
  SchedulePlace,
  Settlement,
  SettlementRecap,
  StyleCreateRequest,
  StyleInfo,
  TravelSchedule,
  UpdatePlaceRequest,
  UserRemainingSchedule,
  UserTimeline,
} from './trip.types';

import {
  effortInfoSchema,
  effortItemListSchema,
  effortItemSchema,
  effortResultSchema,
  expenseInfoSchema,
  expenseListSchema,
  groupInfoSchema,
  groupListSchema,
  guestJoinResultSchema,
  leaderGroupListSchema,
  myStyleCardSchema,
  pastSettlementListSchema,
  placeBlogReviewsSchema,
  placeCommentListSchema,
  placeCommentSchema,
  placeVoteSchema,
  schedulePlaceSchema,
  settlementRecapSchema,
  settlementSchema,
  styleInfoSchema,
  travelScheduleSchema,
  userRemainingScheduleSchema,
  userTimelineSchema,
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
  blogReviews: () => [...tripQueryKeys.all(), 'blog-review'] as const,
  blogReview: (placeId: number) => [...tripQueryKeys.blogReviews(), placeId] as const,
  leaderGroups: () => [...tripQueryKeys.all(), 'leader-group-list'] as const,
  styleCards: () => [...tripQueryKeys.all(), 'style-card'] as const,
  styleCard: (groupId: number) => [...tripQueryKeys.styleCards(), groupId] as const,
  timelines: () => [...tripQueryKeys.all(), 'timeline'] as const,
  timeline: (groupId: number) => [...tripQueryKeys.timelines(), groupId] as const,
  remainingSchedules: () => [...tripQueryKeys.all(), 'remaining-schedule'] as const,
  remainingSchedule: (groupId: number) => [...tripQueryKeys.remainingSchedules(), groupId] as const,
  effortItems: () => [...tripQueryKeys.all(), 'effort-item'] as const,
  effortItemsForGroup: (groupId: number) => [...tripQueryKeys.effortItems(), groupId] as const,
  effortResults: () => [...tripQueryKeys.all(), 'effort-result'] as const,
  effortResult: (groupId: number, targetMemberId: number) =>
    [...tripQueryKeys.effortResults(), groupId, targetMemberId] as const,
  expenses: () => [...tripQueryKeys.all(), 'expense'] as const,
  expensesForGroup: (groupId: number) => [...tripQueryKeys.expenses(), groupId] as const,
  settlements: () => [...tripQueryKeys.all(), 'settlement'] as const,
  settlement: (groupId: number) => [...tripQueryKeys.settlements(), groupId] as const,
  settlementRecaps: () => [...tripQueryKeys.all(), 'settlement-recap'] as const,
  settlementRecap: (groupId: number) => [...tripQueryKeys.settlementRecaps(), groupId] as const,
  pastSettlements: () => [...tripQueryKeys.all(), 'past-settlement'] as const,
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

export const createCustomPlace = async (body: CreatePlaceRequest): Promise<SchedulePlace> => {
  const data = await apiRequest<SchedulePlace>(`/schedules/places`, { method: 'POST', body });
  return schedulePlaceSchema.parse(data);
};

export const updatePlace = async (travelPlaceId: number, body: UpdatePlaceRequest): Promise<SchedulePlace> => {
  const data = await apiRequest<SchedulePlace>(`/schedules/places?travelPlaceId=${travelPlaceId}`, {
    method: 'PATCH',
    body,
  });
  return schedulePlaceSchema.parse(data);
};

export const deletePlace = async (travelPlaceId: number): Promise<void> => {
  await apiRequest(`/schedules/places?travelPlaceId=${travelPlaceId}`, { method: 'DELETE' });
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

export const createPlaceComment = async (travelPlaceId: number, body: CreateCommentRequest): Promise<PlaceComment> => {
  const data = await apiRequest<PlaceComment>(`/comments?travelPlaceId=${travelPlaceId}`, {
    method: 'POST',
    body,
  });
  return placeCommentSchema.parse(data);
};

export const getPlaceBlogReviews = async (travelPlaceId: number): Promise<PlaceBlogReviews> => {
  const data = await apiRequest<{ blogResDto?: unknown }>(`/schedules/detail?travelPlaceId=${travelPlaceId}`);
  return placeBlogReviewsSchema.parse(data.blogResDto ?? {});
};

export const getLeaderGroupList = async (): Promise<LeaderGroupSummary[]> => {
  const data = await apiRequest<LeaderGroupSummary[]>('/groups/styles/groups');
  return leaderGroupListSchema.parse(data);
};

export const getLeaderStyleCard = async (groupId: number): Promise<MyStyleCard> => {
  const data = await apiRequest<MyStyleCard>(`/groups/styles?groupId=${groupId}`);
  return myStyleCardSchema.parse(data);
};

export const getUserTimeline = async (groupId: number): Promise<UserTimeline> => {
  const data = await apiRequest<UserTimeline>(`/users/timeline?groupId=${groupId}`);
  return userTimelineSchema.parse(data);
};

export const getRemainingSchedule = async (groupId: number): Promise<UserRemainingSchedule> => {
  const data = await apiRequest<UserRemainingSchedule>(`/users/timeline/remaining?groupId=${groupId}`);
  return userRemainingScheduleSchema.parse(data);
};

export const getEffortItems = async (groupId: number): Promise<EffortItem[]> => {
  const data = await apiRequest<EffortItem[]>(`/effort-items?groupId=${groupId}`);
  return effortItemListSchema.parse(data);
};

export const createEffortItem = async (groupId: number, body: CreateEffortItemRequest): Promise<EffortItem> => {
  const data = await apiRequest<EffortItem>(`/effort-items?groupId=${groupId}`, {
    method: 'POST',
    body,
  });
  return effortItemSchema.parse(data);
};

export const deleteEffortItem = async (groupId: number, effortItemId: number): Promise<void> => {
  await apiRequest(`/effort-items/${effortItemId}?groupId=${groupId}`, { method: 'DELETE' });
};

export const createEffort = async (body: CreateEffortRequest) => {
  const data = await apiRequest(`/efforts`, { method: 'POST', body });
  return effortInfoSchema.parse(data);
};

export const getEffortResult = async (groupId: number, targetMemberId: number): Promise<EffortResult> => {
  const data = await apiRequest<EffortResult>(`/efforts/result?groupId=${groupId}&targetMemberId=${targetMemberId}`);
  return effortResultSchema.parse(data);
};

export const createExpense = async (body: CreateExpenseRequest): Promise<ExpenseInfo> => {
  const data = await apiRequest<ExpenseInfo>(`/expenses`, { method: 'POST', body });
  return expenseInfoSchema.parse(data);
};

export const getExpenses = async (groupId: number): Promise<ExpenseList> => {
  const data = await apiRequest<ExpenseList>(`/expenses/all?groupId=${groupId}`);
  return expenseListSchema.parse(data);
};

export const getSettlement = async (groupId: number): Promise<Settlement> => {
  const data = await apiRequest<Settlement>(`/settlements?groupId=${groupId}`);
  return settlementSchema.parse(data);
};

export const confirmSettlement = async (groupId: number): Promise<void> => {
  await apiRequest(`/settlements/confirm?groupId=${groupId}`, { method: 'POST' });
};

export const getSettlementRecap = async (groupId: number): Promise<SettlementRecap> => {
  const data = await apiRequest<SettlementRecap>(`/settlements/recap?groupId=${groupId}`);
  return settlementRecapSchema.parse(data);
};

export const getPastSettlements = async (): Promise<PastSettlement[]> => {
  const data = await apiRequest<PastSettlement[]>(`/settlements/history`);
  return pastSettlementListSchema.parse(data);
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

export const placeBlogReviewsQueryOptions = (placeId: number) =>
  queryOptions({
    queryKey: tripQueryKeys.blogReview(placeId),
    queryFn: () => getPlaceBlogReviews(placeId),
    enabled: Number.isFinite(placeId) && placeId > 0,
    retry: 0,
    throwOnError: false,
  });

export const leaderGroupListQueryOptions = queryOptions({
  queryKey: tripQueryKeys.leaderGroups(),
  queryFn: getLeaderGroupList,
  retry: 0,
  throwOnError: false,
});

export const styleCardQueryOptions = (groupId: number) =>
  queryOptions({
    queryKey: tripQueryKeys.styleCard(groupId),
    queryFn: () => getLeaderStyleCard(groupId),
    enabled: Number.isFinite(groupId) && groupId > 0,
    retry: 0,
    throwOnError: false,
  });

export const userTimelineQueryOptions = (groupId: number) =>
  queryOptions({
    queryKey: tripQueryKeys.timeline(groupId),
    queryFn: () => getUserTimeline(groupId),
    enabled: Number.isFinite(groupId) && groupId > 0,
    retry: 0,
    throwOnError: false,
  });

export const remainingScheduleQueryOptions = (groupId: number) =>
  queryOptions({
    queryKey: tripQueryKeys.remainingSchedule(groupId),
    queryFn: () => getRemainingSchedule(groupId),
    enabled: Number.isFinite(groupId) && groupId > 0,
    retry: 0,
    throwOnError: false,
  });

export const effortItemsQueryOptions = (groupId: number) =>
  queryOptions({
    queryKey: tripQueryKeys.effortItemsForGroup(groupId),
    queryFn: () => getEffortItems(groupId),
    enabled: Number.isFinite(groupId) && groupId > 0,
    retry: 0,
    throwOnError: false,
  });

export const effortResultQueryOptions = (groupId: number, targetMemberId: number) =>
  queryOptions({
    queryKey: tripQueryKeys.effortResult(groupId, targetMemberId),
    queryFn: () => getEffortResult(groupId, targetMemberId),
    enabled: Number.isFinite(groupId) && groupId > 0 && Number.isFinite(targetMemberId) && targetMemberId > 0,
    retry: 0,
    throwOnError: false,
  });

export const expensesQueryOptions = (groupId: number) =>
  queryOptions({
    queryKey: tripQueryKeys.expensesForGroup(groupId),
    queryFn: () => getExpenses(groupId),
    enabled: Number.isFinite(groupId) && groupId > 0,
    retry: 0,
    throwOnError: false,
  });

export const settlementQueryOptions = (groupId: number) =>
  queryOptions({
    queryKey: tripQueryKeys.settlement(groupId),
    queryFn: () => getSettlement(groupId),
    enabled: Number.isFinite(groupId) && groupId > 0,
    retry: 0,
    throwOnError: false,
  });

export const settlementRecapQueryOptions = (groupId: number) =>
  queryOptions({
    queryKey: tripQueryKeys.settlementRecap(groupId),
    queryFn: () => getSettlementRecap(groupId),
    enabled: Number.isFinite(groupId) && groupId > 0,
    retry: 0,
    throwOnError: false,
  });

export const pastSettlementsQueryOptions = queryOptions({
  queryKey: tripQueryKeys.pastSettlements(),
  queryFn: getPastSettlements,
  retry: 0,
  throwOnError: false,
});
