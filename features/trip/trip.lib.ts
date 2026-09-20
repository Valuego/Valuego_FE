import { formatDateDot, startOfDay, WEEKDAYS } from '@/shared/components/date-picker';
import { isApiError } from '@/shared/lib/api';
import {
  normalizeInviteInput,
  type MemberKey,
  type Transport,
  type Trip,
  type TripMember,
  type TripPhase,
} from '@/shared/session';

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

const DESTINATION_MAP_CENTER: Record<string, { lat: number; lng: number }> = {
  부산: { lat: 35.1796, lng: 129.0756 },
  BUSAN: { lat: 35.1796, lng: 129.0756 },
  강릉: { lat: 37.7519, lng: 128.8761 },
  GANGNEUNG: { lat: 37.7519, lng: 128.8761 },
  경주: { lat: 35.8562, lng: 129.2247 },
  GYEONGJU: { lat: 35.8562, lng: 129.2247 },
  여수: { lat: 34.7604, lng: 127.6622 },
  YEOSU: { lat: 34.7604, lng: 127.6622 },
  전주: { lat: 35.8242, lng: 127.148 },
  JEONJU: { lat: 35.8242, lng: 127.148 },
  속초: { lat: 38.207, lng: 128.5918 },
  SOKCHO: { lat: 38.207, lng: 128.5918 },
};

export const getDestinationMapCenter = (destination?: string) => {
  return DESTINATION_MAP_CENTER[destination ?? '부산'] ?? { lat: 35.1796, lng: 129.0756 };
};

export const transportFromUi = (transport: Transport): TransportType => {
  return transport === 'transit' ? 'PUBLIC' : 'RENT';
};

export const transportToUi = (transportType: TransportType): Transport => {
  return transportType === 'PUBLIC' ? 'transit' : 'car';
};

export const budgetFromLabel = (label: string): BudgetType => {
  return BUDGET_FROM_LABEL[label] ?? 'MODERATE';
};

const BUDGET_TO_LABEL: Record<BudgetType, string> = {
  ECONOMICAL: '알뜰하게',
  MODERATE: '적당히',
  LUXURY: '플렉스',
};

const FOOD_TO_LABEL: Record<FoodType, string> = {
  KOREAN: '한식',
  JAPANESE: '일식',
  CHINESE: '중식',
};

export const budgetToLabel = (type: BudgetType) => BUDGET_TO_LABEL[type];

export const foodToLabel = (type: FoodType) => FOOD_TO_LABEL[type];

export const isScheduleNotFound = (error: unknown) => {
  if (!isApiError(error)) {
    return false;
  }
  return error.status === 404 || error.errorData?.code === 'TRAVEL-001';
};

export const isHostStyleComplete = (trip: Trip) => {
  const host = trip.members.find((member) => member.role.includes('호스트'));
  if (host) {
    return host.statusLabel === '완료';
  }
  return trip.foods.length > 0;
};

export const formatDayChipDate = (startDate: string, dayNumber: number) => {
  const date = parseIsoDate(startDate);
  date.setDate(date.getDate() + Math.max(0, dayNumber - 1));
  return `${date.getMonth() + 1}.${date.getDate()} ${WEEKDAYS[date.getDay()]}`;
};

export const formatScheduleSummary = (placeCount: number, transport: Transport, distanceKm?: number | null) => {
  const transportLabel = transport === 'transit' ? '대중교통' : '렌터카';
  if (typeof distanceKm === 'number') {
    return `경유지 ${placeCount}곳 · ${transportLabel} ${distanceKm.toFixed(1)}km`;
  }
  return `경유지 ${placeCount}곳 · ${transportLabel}`;
};

export const resolvePlanningPath = ({
  tripId,
  isGuest,
  hasSchedule,
  hostStyleComplete,
}: {
  tripId: string;
  isGuest: boolean;
  hasSchedule: boolean;
  hostStyleComplete: boolean;
}) => {
  if (hasSchedule || isGuest) {
    return buildTripHref(tripId, 'schedule');
  }
  if (!hostStyleComplete) {
    return buildTripHref(tripId, 'invite');
  }
  return buildTripHref(tripId, 'prep');
};

export const resolveTripEntryPath = (trip: { id: string; phase: TripPhase }) => {
  if (trip.phase === 'settled') {
    return buildTripHref(trip.id, 'settlement', 'recap');
  }
  return buildTripHref(trip.id);
};

/** 백엔드가 그룹 상태를 자동으로 완료 처리하지 않아도, 여행 종료일이 지났으면 지난 여행으로 취급한다 */
export const isTripPeriodOver = (trip: Pick<Trip, 'endDate'>): boolean => {
  if (!trip.endDate) {
    return false;
  }
  return parseIsoDate(trip.endDate).getTime() < startOfDay(new Date()).getTime();
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

const memberStatusLabel = (status: GroupMemberInfo['memberStatus']) => {
  if (status === 'COMPLETED') {
    return '완료';
  }
  if (status === 'BEFORE_PREFERENCE') {
    return '성향 입력 전';
  }
  return '대기 중';
};

const toTripMember = (member: GroupMemberInfo, viewerIsGuest = false): TripMember => {
  const isLeader = member.memberRole === 'LEADER';
  const isDone = member.memberStatus === 'COMPLETED';

  return {
    id: String(member.groupMemberId),
    name: member.memberName,
    role: isLeader ? (viewerIsGuest ? '호스트' : '나 · 호스트') : '친구',
    member: MEMBER_COLOR_TO_KEY[member.memberColor],
    status: isDone ? 'done' : isLeader ? 'host' : 'pending',
    statusLabel: memberStatusLabel(member.memberStatus),
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
    endDate: group.endDate,
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

export const toInviteToken = (groupLink: string) => {
  return normalizeInviteInput(groupLink);
};

export const buildInvitePath = (groupLink: string) => {
  const token = toInviteToken(groupLink);
  if (!token) {
    return '/join';
  }
  return `/invite/${encodeURIComponent(token)}`;
};

export const buildInviteUrl = (origin: string, groupLink: string) => {
  return `${origin}${buildInvitePath(groupLink)}`;
};

export const formatInviteLinkLabel = (groupLink: string, origin?: string) => {
  if (!origin) {
    return toInviteToken(groupLink);
  }

  try {
    const url = new URL(buildInvitePath(groupLink), origin);
    return `${url.host}${url.pathname}`.replace(/\/$/, '');
  } catch {
    return toInviteToken(groupLink);
  }
};

export const isInviteMemberComplete = (statusLabel: string) => {
  return statusLabel === '완료';
};

export const isInviteMemberWaiting = (statusLabel: string) => {
  return statusLabel === '대기 중';
};

export const toInviteStatusLabel = (member: TripMember) => {
  if (member.role.includes('호스트')) {
    return member.statusLabel;
  }
  if (isInviteMemberWaiting(member.statusLabel)) {
    return '대기 중';
  }
  return '완료';
};

export const isInviteSeatFilled = (member: TripMember) => {
  return !isInviteMemberWaiting(toInviteStatusLabel(member));
};

export const buildInviteShareText = (userName: string, destination: string) => {
  const name = userName.trim() || '친구';
  const place = destination.trim() || '여행';
  return `${name}님이 ${place}에 당신을 초대되었습니다`;
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

  const extraPending = local.members.filter(
    (member) => member.id.startsWith('invite-pending-') && member.statusLabel === '대기 중',
  );
  const remainingSlots = Math.max(0, remote.memberCount - remote.members.length);
  const members = remainingSlots > 0 ? [...remote.members, ...extraPending.slice(0, remainingSlots)] : remote.members;

  return {
    ...remote,
    members,
    budget: local.budget,
    foods: local.foods.length ? local.foods : remote.foods,
    activity: local.activity,
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
