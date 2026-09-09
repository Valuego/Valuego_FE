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
  dayNumber: number;
  totalDistanceKm?: number | null;
  places: SchedulePlace[];
};

export type TravelSchedule = {
  travelId: number;
  days: ScheduleDay[];
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
