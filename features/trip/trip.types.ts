import type { Transport } from '@/shared/session';

export type Destination = 'BUSAN' | 'GANGNEUNG' | 'GYEONGJU' | 'YEOSU' | 'JEONJU' | 'SOKCHO';

export type TransportType = 'RENT' | 'PUBLIC';

export type GroupStatus = 'PLANNING' | 'CONFIRMED' | 'COMPLETED';

export type MemberColor = 'BLUE' | 'PURPLE' | 'SKYBLUE' | 'ORANGE';

export type MemberRole = 'LEADER' | 'MEMBER';

export type MemberStatus = 'PENDING' | 'BEFORE_PREFERENCE' | 'COMPLETED';

export type BudgetType = 'ECONOMICAL' | 'MODERATE' | 'LUXURY';

export type FoodType = 'KOREAN' | 'JAPANESE' | 'CHINESE';

export type GroupMemberInfo = {
  groupMemberId: number;
  memberName: string;
  memberColor: MemberColor;
  memberRole: MemberRole;
  memberStatus: MemberStatus;
};

export type GroupSummary = {
  inviterName: string;
  title: string;
  destination?: Destination;
  startDate?: string;
  endDate?: string;
  memberCount: number;
  duration: string;
};

export type GroupInfo = {
  groupId: number;
  title: string;
  destination: Destination;
  startDate: string;
  endDate: string;
  currentMemberCount: number;
  memberCount: number;
  transportType: TransportType;
  groupLink: string;
  dDay: string;
  members: GroupMemberInfo[];
  groupStatus: GroupStatus;
};

export type GroupList = {
  ongoingGroups: GroupInfo[];
  pastGroups: GroupInfo[];
};

export type GroupCreateRequest = {
  title: string;
  destination: Destination;
  startDate: string;
  endDate: string;
  memberCount: number;
  transportType: TransportType;
};

export type StyleCreateRequest = {
  budgetType: BudgetType;
  foodType: FoodType;
  activityIntensity: number;
};

export type StyleInfo = {
  styleId: number;
  groupId: number;
  groupMemberId: number;
  budgetType: BudgetType;
  foodType: FoodType;
  activityIntensity: number;
};

export type SchedulePlace = {
  travelPlaceId: number;
  contentId?: string | null;
  visitTime?: string | null;
  name?: string | null;
  address?: string | null;
  imageUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  scheduleOrder?: number | null;
  placeType?: string | null;
  reason?: string | null;
  distanceFromPreviousKm?: number | null;
  memoUrl?: string | null;
};

export type ScheduleDay = {
  travelDayId: number;
  dayNumber: number;
  totalDistanceKm?: number | null;
  places: SchedulePlace[];
};

export type TravelSchedule = {
  travelId: number;
  days: ScheduleDay[];
};

export type CreatePlaceRequest = {
  travelDayId: number;
  scheduleOrder?: number;
  customName: string;
  visitTime?: string;
  memoUrl?: string;
};

export type UpdatePlaceRequest = {
  customName?: string;
  scheduleOrder?: number;
  visitTime?: string;
  memoUrl?: string;
};

export type CreateTripPayload = {
  destinationLabel: string;
  title: string;
  startDate: string;
  endDate: string;
  memberCount: number;
  transport: Transport;
  budgetLabel: string;
  foodLabels: string[];
  activitySlider: number;
};

export type GuestJoinRequest = {
  memberName: string;
  memberColor: MemberColor;
};

export type GuestJoinResult = {
  groupMemberId: number;
  memberName: string;
  memberColor: MemberColor;
  group: GroupInfo;
};

export type PlaceVoteStatus = 'LIKE' | 'DISLIKE';

export type PlaceVote = {
  likeCount: number;
  likePercentage: number;
  dislikeCount: number;
  dislikePercentage: number;
  totalParticipantCount: number;
  totalGroupMemberCount: number;
  voteStatus?: PlaceVoteStatus | null;
};

export type PlaceComment = {
  commentId: number;
  nickname?: string | null;
  content: string;
  createdAt: string;
};

export type PlaceCommentList = {
  commentCount: number;
  comments: PlaceComment[];
};

export type CreateCommentRequest = {
  content: string;
};

export type PlaceBlogPost = {
  title: string;
  description: string;
  bloggerName: string;
  postDate: string;
  link: string;
};

export type PlaceBlogReviews = {
  keyword?: string;
  totalReviewUrl?: string;
  totalCount: number;
  reviews: PlaceBlogPost[];
};

export type AiScheduleUpdateRequest = {
  groupId: number;
  dayNum: number;
  prompt: string;
};

export type AiOriginalPlace = {
  contentId?: string;
  visitTime?: string;
  placeName?: string;
};

export type AiSuggestedPlace = {
  contentId?: string;
  visitTime?: string;
  placeType?: string;
  reason?: string;
};

export type AiScheduleSuggestion = {
  summaryTitle?: string;
  dayNumber: number;
  originalPlace?: AiOriginalPlace;
  newPlaces: AiSuggestedPlace[];
};

export type LeaderGroupSummary = {
  groupId: number;
  title: string;
  startDate: string;
  endDate: string;
};

export type MyStyleCard = {
  styleId: number;
  groupId: number;
  groupMemberId: number;
  dnaTitle: string;
  dnaDescription: string;
  tags: string[];
  activityLevelText: string;
  budgetStyleText: string;
  preferredFoodText: string;
  budgetType: BudgetType;
  foodType: FoodType;
  activityIntensity: number;
};

export type UserTimelineItem = {
  id: number;
  title: string;
  time: string;
  category: string;
  description?: string | null;
};

export type UserTimeline = {
  currentDay: number;
  totalExpense: number;
  items: UserTimelineItem[];
};

export type EffortItemCategory = 'DRIVING' | 'RESERVATION' | 'ETC';

export type EffortItemMember = {
  groupMemberId: number;
  memberName: string;
};

export type EffortItem = {
  effortItemId: number;
  title: string;
  isCustom: boolean;
  memberList: EffortItemMember[];
};

export type CreateEffortItemRequest = {
  itemCategory: EffortItemCategory;
  title?: string;
};

export type CreateEffortRequest = {
  groupId: number;
  targetMemberId: number;
  effortAmount: number;
  comment?: string;
  effortItemId: number;
};

export type EffortResult = {
  targetMemberId: number;
  targetMemberName: string;
  totalRewardAmount: number;
  evaluatorCount: number;
  comments: string[];
};

export type ExpenseCategory = 'MEAL' | 'GAS' | 'ACCOMMODATION' | 'CAFE' | 'OTHER';

export type CreateExpenseRequest = {
  groupId: number;
  amount: number;
  category?: ExpenseCategory;
  expenseDate?: string;
  payers: { groupMemberId: number }[];
  participants: { groupMemberId: number; isIncluded: boolean }[];
};

export type ExpenseInfo = {
  expenseId: number;
  amount: number;
  category: ExpenseCategory | null;
  expenseDate: string | null;
  payerName: string;
  participantCount: number;
};

export type ExpenseList = {
  totalAmount: number;
  expenseInfoResDtos: ExpenseInfo[];
};

export type SettlementEffortReward = {
  groupMemberId: number;
  memberName: string;
  effortTitle: string;
  rewardAmount: number;
};

export type SettlementType = 'SEND' | 'GIVE' | 'ZERO';

export type SettlementMemberRow = {
  groupMemberId: number;
  memberName: string;
  settlementType: SettlementType;
  amount: number;
};

export type Settlement = {
  totalExpense: number;
  expensePerMember: number;
  isConfirmed: boolean;
  effortRewards: SettlementEffortReward[];
  memberSettlements: SettlementMemberRow[];
};

export type SettlementRecap = {
  groupId: number;
  groupTitle: string;
  groupPeriod: string;
  durationText: string;
  memberCount: number;
  totalDistance: string;
  totalExpenseAmount: number;
  gameResult: string;
  totalEffortAmount: number;
};

export type PastSettlement = {
  groupId: number;
  settlementId: number;
  groupTitle: string;
  groupPeriod: string;
  totalExpense: number;
  expensePerMember: number;
};

export type RemainingScheduleItem = {
  travelPlaceId: number;
  time: string;
  placeName: string;
  category: string;
};

export type UserRemainingSchedule = {
  groupId: number;
  scheduleStatus: string;
  groupTitle: string;
  currentDay: number;
  currentStatus: string;
  totalExpense: number;
  todaySchedules: RemainingScheduleItem[];
};
