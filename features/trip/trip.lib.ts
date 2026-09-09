import { formatDateDot, startOfDay } from '@/shared/components/date-picker';
import type { MemberKey, Transport, Trip, TripMember, TripPhase } from '@/shared/session';

import type {
  BudgetType,
  CreateTripPayload,
  Destination,
  FoodType,
  GroupInfo,
  GroupMemberInfo,
  GroupStatus,
  MemberColor,
  TransportType,
} from './trip.types';

import { DEFAULT_PLACE_TYPE_STYLE, PLACE_TYPE_STYLE } from './trip.constants';

const DESTINATION_LABEL: Record<Destination, string> = {
  BUSAN: '부산',
  GANGNEUNG: '강릉',
  GYEONGJU: '경주',
  YEOSU: '여수',
  JEONJU: '전주',
  SOKCHO: '속초',
};

const DESTINATION_FROM_LABEL: Record<string, Destination> = {
  부산: 'BUSAN',
  강릉: 'GANGNEUNG',
  경주: 'GYEONGJU',
  여수: 'YEOSU',
  전주: 'JEONJU',
  속초: 'SOKCHO',
};

const BUDGET_FROM_LABEL: Record<string, BudgetType> = {
  알뜰하게: 'ECONOMICAL',
  적당히: 'MODERATE',
  플렉스: 'LUXURY',
};

const FOOD_FROM_LABEL: Record<string, FoodType> = {
  한식: 'KOREAN',
  일식: 'JAPANESE',
  중식: 'CHINESE',
};

const MEMBER_COLOR_TO_KEY: Record<MemberColor, MemberKey> = {
  BLUE: 'doyeon',
  PURPLE: 'seojun',
  SKYBLUE: 'hayeong',
  ORANGE: 'minjae',
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const parseGroupId = (tripId: string): number | null => {
  const normalized = decodeTripId(tripId);
  if (!/^\d+$/.test(normalized)) {
    return null;
  }
  const groupId = Number(normalized);
  return Number.isSafeInteger(groupId) ? groupId : null;
};

export const decodeTripId = (tripId: string) => {
  try {
    return decodeURIComponent(tripId);
  } catch {
    return tripId;
  }
};

export const buildTripHref = (tripId: string, ...segments: string[]) => {
  const encodedId = encodeURIComponent(decodeTripId(tripId));
  if (segments.length === 0) {
    return `/trips/${encodedId}`;
  }
  return `/trips/${encodedId}/${segments.map((segment) => encodeURIComponent(segment)).join('/')}`;
};

export const parseIsoDate = (value: string) => {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
};

export const toIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const toLocalDateTime = (isoDate: string, endOfDay = false) => {
  return `${isoDate}T${endOfDay ? '23:59:59' : '00:00:00'}`;
};

export const formatDateRangeLabel = (start: Date, end: Date) => {
  const startLabel = formatDateDot(start);
  const sameYear = start.getFullYear() === end.getFullYear();
  const endLabel = sameYear
    ? `${String(end.getMonth() + 1).padStart(2, '0')}.${String(end.getDate()).padStart(2, '0')}`
    : formatDateDot(end);
  return `${startLabel} – ${endLabel}`;
};

export const formatNightsLabel = (start: Date, end: Date) => {
  const nights = Math.max(0, Math.round((startOfDay(end).getTime() - startOfDay(start).getTime()) / MS_PER_DAY));
  return `${nights}박 ${nights + 1}일`;
};

export const getDefaultTripDates = () => {
  const start = startOfDay(new Date());
  start.setDate(start.getDate() + 1);
  const end = new Date(start);
  end.setDate(end.getDate() + 2);
  return {
    startDate: toIsoDate(start),
    endDate: toIsoDate(end),
    dateLabel: formatDateRangeLabel(start, end),
    nightsLabel: formatNightsLabel(start, end),
  };
};

export const destinationFromLabel = (label: string): Destination => {
  return DESTINATION_FROM_LABEL[label] ?? 'BUSAN';
};

export const destinationToLabel = (destination: Destination) => DESTINATION_LABEL[destination];

export const transportFromUi = (transport: Transport): TransportType => {
  return transport === 'transit' ? 'PUBLIC' : 'RENT';
};

export const transportToUi = (transportType: TransportType): Transport => {
  return transportType === 'PUBLIC' ? 'transit' : 'car';
};

export const budgetFromLabel = (label: string): BudgetType => {
  return BUDGET_FROM_LABEL[label] ?? 'MODERATE';
};

export const foodFromLabels = (labels: string[]): FoodType => {
  const first = labels[0];
  return (first ? FOOD_FROM_LABEL[first] : undefined) ?? 'KOREAN';
};

export const activityToIntensity = (slider: number) => {
  return Math.min(5, Math.max(1, Math.round((slider / 100) * 4) + 1));
};

const groupStatusToPhase = (status: GroupStatus): TripPhase => {
  if (status === 'CONFIRMED') {
    return 'ongoing';
  }
  if (status === 'COMPLETED') {
    return 'settled';
  }
  return 'planning';
};

type GroupToTripOptions = {
  viewerIsGuest?: boolean;
};

const toTripMember = (member: GroupMemberInfo, viewerIsGuest = false): TripMember => {
  const isLeader = member.memberRole === 'LEADER';
  const isDone = member.memberStatus === 'COMPLETED';

  return {
    id: String(member.groupMemberId),
    name: member.memberName,
    role: isLeader ? (viewerIsGuest ? '호스트' : '나 · 호스트') : '친구',
    member: MEMBER_COLOR_TO_KEY[member.memberColor],
    status: isLeader ? 'host' : isDone ? 'done' : 'pending',
    statusLabel: isDone ? '완료' : isLeader ? '성향 입력 전' : '대기 중',
  };
};

const startDateDday = (startDate: string) => {
  const start = startOfDay(parseIsoDate(startDate));
  const today = startOfDay(new Date());
  const days = Math.round((start.getTime() - today.getTime()) / MS_PER_DAY);

  if (days > 0) {
    return `D-${days}`;
  }
  if (days === 0) {
    return 'D-Day';
  }
  return `D+${Math.abs(days)}`;
};

export const groupToTrip = (group: GroupInfo, options?: GroupToTripOptions): Trip => {
  const start = parseIsoDate(group.startDate);
  const end = parseIsoDate(group.endDate);
  const phase = groupStatusToPhase(group.groupStatus);
  const viewerIsGuest = options?.viewerIsGuest ?? false;

  return {
    id: String(group.groupId),
    title: group.title,
    destination: destinationToLabel(group.destination),
    dateLabel: formatDateRangeLabel(start, end),
    nightsLabel: formatNightsLabel(start, end),
    phase,
    dDayLabel: phase === 'settled' ? undefined : startDateDday(group.startDate),
    memberCount: group.memberCount,
    transport: transportToUi(group.transportType),
    budget: '적당히',
    foods: [],
    activity: 50,
    members: group.members.map((member) => toTripMember(member, viewerIsGuest)),
    inviteCode: group.groupLink,
    timeline: [],
    roles: [],
    todos: [],
    expenses: [],
    laborCategories: [],
    laborValues: [],
    settlementConfirmed: false,
  };
};

export const getGroupLeader = (group: GroupInfo) => {
  return group.members.find((member) => member.memberRole === 'LEADER') ?? group.members[0] ?? null;
};

export const formatInviteDateBadge = (startDate: string, endDate: string) => {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  const startPart = `${start.getMonth() + 1}.${start.getDate()}`;
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const endPart = sameMonth ? String(end.getDate()) : `${end.getMonth() + 1}.${end.getDate()}`;
  return `${startPart}–${endPart} · ${formatNightsLabel(start, end)}`;
};

export const formatVisitTime = (visitTime?: string | null) => {
  if (!visitTime) {
    return '시간 미정';
  }
  return visitTime.slice(0, 5);
};

export const buildInvitePath = (groupLink: string) => {
  return `/invite/${encodeURIComponent(groupLink)}`;
};

export const buildInviteUrl = (origin: string, groupLink: string) => {
  return `${origin}${buildInvitePath(groupLink)}`;
};

export const toCreateGroupRequest = (payload: CreateTripPayload) => {
  return {
    title: payload.title,
    destination: destinationFromLabel(payload.destinationLabel),
    startDate: toLocalDateTime(payload.startDate),
    endDate: toLocalDateTime(payload.endDate, true),
    memberCount: payload.memberCount,
    transportType: transportFromUi(payload.transport),
  };
};

export const toCreateStyleRequest = (payload: CreateTripPayload) => {
  return {
    budgetType: budgetFromLabel(payload.budgetLabel),
    foodType: foodFromLabels(payload.foodLabels),
    activityIntensity: activityToIntensity(payload.activitySlider),
  };
};

const PHASE_RANK: Record<TripPhase, number> = {
  drafting: 0,
  inviting: 1,
  planning: 2,
  ongoing: 3,
  settling: 4,
  settled: 5,
};

export const mergeTripWithLocal = (remote: Trip, local?: Trip | null): Trip => {
  if (!local) {
    return remote;
  }

  return {
    ...remote,
    expenses: local.expenses.length ? local.expenses : remote.expenses,
    timeline: local.timeline.length ? local.timeline : remote.timeline,
    todos: local.todos.length ? local.todos : remote.todos,
    roles: local.roles.length ? local.roles : remote.roles,
    laborCategories: local.laborCategories.length ? local.laborCategories : remote.laborCategories,
    laborValues: local.laborValues.length ? local.laborValues : remote.laborValues,
    settlementConfirmed: local.settlementConfirmed || remote.settlementConfirmed,
    totalAmount: local.totalAmount ?? remote.totalAmount,
    perPersonAmount: local.perPersonAmount ?? remote.perPersonAmount,
    phase: PHASE_RANK[local.phase] > PHASE_RANK[remote.phase] ? local.phase : remote.phase,
    dDayLabel:
      PHASE_RANK[local.phase] > PHASE_RANK[remote.phase] ? (local.dDayLabel ?? remote.dDayLabel) : remote.dDayLabel,
  };
};

export const getPlaceTypeStyle = (placeType?: string | null) => {
  if (!placeType) {
    return DEFAULT_PLACE_TYPE_STYLE;
  }
  return PLACE_TYPE_STYLE[placeType] ?? { ...DEFAULT_PLACE_TYPE_STYLE, label: placeType };
};

export const laborRewardFor = (trip: Trip, memberId: string) => {
  const saved = trip.laborValues.find((item) => item.memberId === memberId);
  if (saved) {
    return saved.amount;
  }
  const assignedCount = trip.laborCategories.filter((item) => item.assigneeId === memberId).length;
  if (assignedCount > 0) {
    return assignedCount * 15000;
  }
  return 15000;
};
