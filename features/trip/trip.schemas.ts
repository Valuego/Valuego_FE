import { z } from 'zod';

const destinationSchema = z.enum(['BUSAN', 'GANGNEUNG', 'GYEONGJU', 'YEOSU', 'JEONJU', 'SOKCHO']);
const transportTypeSchema = z.enum(['RENT', 'PUBLIC']);
const groupStatusSchema = z.enum(['PLANNING', 'CONFIRMED', 'COMPLETED']);
const memberColorSchema = z.enum(['BLUE', 'PURPLE', 'SKYBLUE', 'ORANGE']);
const memberRoleSchema = z.enum(['LEADER', 'MEMBER']);
const memberStatusSchema = z.enum(['PENDING', 'BEFORE_PREFERENCE', 'COMPLETED']);
const budgetTypeSchema = z.enum(['ECONOMICAL', 'MODERATE', 'LUXURY']);
const foodTypeSchema = z.enum(['KOREAN', 'JAPANESE', 'CHINESE']);

export const groupMemberInfoSchema = z.object({
  groupMemberId: z.coerce.number(),
  memberName: z.string(),
  memberColor: memberColorSchema,
  memberRole: memberRoleSchema,
  memberStatus: memberStatusSchema,
});

export const groupInfoSchema = z.object({
  groupId: z.coerce.number(),
  title: z.string(),
  destination: destinationSchema,
  startDate: z.string(),
  endDate: z.string(),
  currentMemberCount: z.coerce.number().optional().default(0),
  memberCount: z.coerce.number(),
  transportType: transportTypeSchema,
  groupLink: z.string(),
  dDay: z.string().optional().default(''),
  members: z.array(groupMemberInfoSchema).optional().default([]),
  groupStatus: groupStatusSchema,
});

export const groupListSchema = z.object({
  ongoingGroups: z.array(groupInfoSchema),
  pastGroups: z.array(groupInfoSchema),
});

export const groupSummarySchema = z.object({
  inviterName: z.string().optional().default('친구'),
  title: z.string().optional().default('우정여행'),
  destination: destinationSchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  memberCount: z.coerce.number().optional().default(4),
  duration: z.string().optional().default(''),
});

export const styleInfoSchema = z.object({
  styleId: z.number(),
  groupId: z.number(),
  groupMemberId: z.number(),
  budgetType: budgetTypeSchema,
  foodType: foodTypeSchema,
  activityIntensity: z.number(),
});

const coordSchema = z.preprocess((value) => {
  if (value === '' || value == null) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}, z.number().nullable().optional());

const optionalIdSchema = z.preprocess((value) => {
  if (value === '' || value == null) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}, z.number().optional());

export const schedulePlaceSchema = z
  .object({
    travelPlaceId: optionalIdSchema,
    contentId: z.string().nullable().optional(),
    visitTime: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    imageUrl: z.string().nullable().optional(),
    latitude: coordSchema,
    longitude: coordSchema,
    scheduleOrder: z.number().nullable().optional(),
    placeType: z.string().nullable().optional(),
    reason: z.string().nullable().optional(),
    distanceFromPreviousKm: z.number().nullable().optional(),
    memoUrl: z.string().nullable().optional(),
  })
  .transform((place) => ({
    ...place,
    travelPlaceId: place.travelPlaceId ?? 0,
  }));

export const scheduleDaySchema = z
  .object({
    travelDayId: optionalIdSchema,
    dayNumber: z.preprocess((value) => {
      if (value === '' || value == null) {
        return 1;
      }
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 1;
    }, z.number()),
    totalDistanceKm: z.number().nullable().optional(),
    places: z.array(schedulePlaceSchema).optional().default([]),
  })
  .transform((day) => ({
    ...day,
    travelDayId: day.travelDayId ?? 0,
    places: day.places.map((place, placeIndex) => ({
      ...place,
      travelPlaceId: place.travelPlaceId > 0 ? place.travelPlaceId : day.dayNumber * 1000 + placeIndex + 1,
    })),
  }));

export const travelScheduleSchema = z
  .object({
    travelId: optionalIdSchema,
    days: z.array(scheduleDaySchema).optional().default([]),
  })
  .transform((schedule) => ({
    ...schedule,
    travelId: schedule.travelId ?? 0,
  }));

export const guestJoinResultSchema = z.object({
  groupMemberId: z.number(),
  memberName: z.string(),
  memberColor: memberColorSchema,
  group: groupInfoSchema,
});

export const placeVoteSchema = z.object({
  likeCount: z.number(),
  likePercentage: z.number(),
  dislikeCount: z.number(),
  dislikePercentage: z.number(),
  totalParticipantCount: z.number(),
  totalGroupMemberCount: z.number(),
  voteStatus: z.enum(['LIKE', 'DISLIKE']).nullable().optional(),
});

export const placeCommentSchema = z.object({
  commentId: z.number(),
  nickname: z.string().nullable().optional(),
  content: z.string(),
  createdAt: z.string(),
});

export const placeCommentListSchema = z.object({
  commentCount: z.number(),
  comments: z.array(placeCommentSchema),
});

const nullishString = () =>
  z
    .string()
    .nullish()
    .transform((value) => value ?? '');

export const placeBlogPostSchema = z.object({
  title: nullishString(),
  description: nullishString(),
  bloggerName: nullishString(),
  postDate: nullishString(),
  link: nullishString(),
});

export const placeBlogReviewsSchema = z.object({
  keyword: z
    .string()
    .nullish()
    .transform((value) => value ?? undefined),
  totalReviewUrl: z
    .string()
    .nullish()
    .transform((value) => value ?? undefined),
  totalCount: z
    .number()
    .nullish()
    .transform((value) => value ?? 0),
  reviews: z
    .array(placeBlogPostSchema)
    .nullish()
    .transform((value) => value ?? []),
});

export const leaderGroupSummarySchema = z.object({
  groupId: z.coerce.number(),
  title: z.string(),
  startDate: z.string(),
  endDate: z.string(),
});

export const leaderGroupListSchema = z.array(leaderGroupSummarySchema);

export const myStyleCardSchema = z.object({
  styleId: z.coerce.number(),
  groupId: z.coerce.number(),
  groupMemberId: z.coerce.number(),
  dnaTitle: z.string(),
  dnaDescription: z.string(),
  tags: z.array(z.string()).optional().default([]),
  activityLevelText: z.string(),
  budgetStyleText: z.string(),
  preferredFoodText: z.string(),
  budgetType: budgetTypeSchema,
  foodType: foodTypeSchema,
  activityIntensity: z.number(),
});

export const userTimelineItemSchema = z.object({
  id: z.coerce.number(),
  title: z.string(),
  time: z.string(),
  category: z.string(),
  description: z.string().nullable().optional(),
});

export const userTimelineSchema = z.object({
  currentDay: z.number(),
  totalExpense: z.number(),
  items: z.array(userTimelineItemSchema),
});

export const remainingScheduleItemSchema = z.object({
  travelPlaceId: z.coerce.number(),
  time: z.string(),
  placeName: z.string(),
  category: z.string(),
});

const expenseCategorySchema = z.enum(['MEAL', 'GAS', 'ACCOMMODATION', 'CAFE', 'OTHER']);
const settlementTypeSchema = z.enum(['SEND', 'GIVE', 'ZERO']);

export const effortItemMemberSchema = z.object({
  groupMemberId: z.coerce.number(),
  memberName: z.string(),
});

export const effortItemSchema = z.object({
  effortItemId: z.coerce.number(),
  title: z.string(),
  isCustom: z.boolean(),
  memberList: z
    .array(effortItemMemberSchema)
    .nullable()
    .transform((list) => list ?? []),
});

export const effortItemListSchema = z.array(effortItemSchema);

export const effortInfoSchema = z.object({
  effortId: z.coerce.number(),
  writerMemberId: z.coerce.number(),
  targetMemberId: z.coerce.number(),
  targetMemberName: z.string(),
  effortItemId: z.coerce.number(),
  effortAmount: z.coerce.number().nullable().optional(),
  comment: z.string().nullable().optional(),
});

export const effortResultSchema = z.object({
  targetMemberId: z.coerce.number(),
  targetMemberName: z.string(),
  totalRewardAmount: z.coerce
    .number()
    .nullable()
    .transform((value) => value ?? 0),
  evaluatorCount: z.number(),
  comments: z.array(z.string()),
});

export const expenseInfoSchema = z.object({
  expenseId: z.coerce.number(),
  amount: z.coerce.number(),
  category: expenseCategorySchema.nullable(),
  expenseDate: z.string().nullable(),
  payerName: z.string(),
  participantCount: z.number(),
});

export const expenseListSchema = z.object({
  totalAmount: z.coerce.number(),
  expenseInfoResDtos: z.array(expenseInfoSchema),
});

export const settlementEffortRewardSchema = z.object({
  groupMemberId: z.coerce.number(),
  memberName: z.string(),
  effortTitle: z.string(),
  rewardAmount: z.coerce.number(),
});

export const settlementMemberRowSchema = z.object({
  groupMemberId: z.coerce.number(),
  memberName: z.string(),
  settlementType: settlementTypeSchema,
  amount: z.coerce.number(),
});

export const settlementSchema = z.object({
  totalExpense: z.coerce.number(),
  expensePerMember: z.coerce.number(),
  isConfirmed: z.boolean(),
  effortRewards: z.array(settlementEffortRewardSchema),
  memberSettlements: z.array(settlementMemberRowSchema),
});

export const settlementRecapSchema = z.object({
  groupId: z.coerce.number().optional().default(0),
  groupTitle: z.string().optional().default(''),
  groupPeriod: z.string().optional().default(''),
  durationText: z.string().optional().default(''),
  memberCount: z.coerce.number().optional().default(0),
  totalDistance: z.string().optional().default('0km'),
  totalExpenseAmount: z.coerce.number().optional().default(0),
  gameResult: z.string().optional().default('진행한 게임 없음'),
  totalEffortAmount: z.coerce.number().optional().default(0),
});

export const pastSettlementSchema = z.object({
  groupId: z.coerce.number(),
  settlementId: z.coerce.number(),
  groupTitle: z.string(),
  groupPeriod: z.string(),
  totalExpense: z.coerce.number(),
  expensePerMember: z.coerce.number(),
});

export const pastSettlementListSchema = z.array(pastSettlementSchema);

export const userRemainingScheduleSchema = z.object({
  groupId: z.coerce.number(),
  scheduleStatus: z.string(),
  groupTitle: z.string(),
  currentDay: z.number(),
  currentStatus: z.string(),
  totalExpense: z.number(),
  todaySchedules: z.array(remainingScheduleItemSchema),
});
