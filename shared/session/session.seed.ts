import type {
  AppSession,
  Trip,
  TripDraft,
  TripLaborCategory,
  TripRoleItem,
  TripTodoItem,
  UserProfile,
} from './session.types';

export const SESSION_STORAGE_KEY = 'valuego.session.v1';

export const DEFAULT_USER: UserProfile = {
  name: '김도연',
  greetingName: '도연',
  email: 'doyeon@naver.com',
  member: 'doyeon',
  personalityTitle: '액티비티 러버',
  personalityDescription: '알찬 일정을 좋아하고, 맛집은 꼭 들르는 타입',
  tags: ['#부지런', '#맛집헌터', '#가성비'],
};

export const DEFAULT_DRAFT: TripDraft = {
  destination: '부산',
  dateLabel: '날짜를 선택해 주세요',
  nightsLabel: '기간 미정',
  startDate: '',
  endDate: '',
  memberCount: 4,
  transport: 'car',
  budget: '적당히',
  foods: ['한식', '중식'],
  activity: 52,
};

export const DEFAULT_ROLES: TripRoleItem[] = [
  { id: 'role-host', title: '총무', description: '예약·정산·공지', assigneeId: null, assigneeName: null },
  { id: 'role-nav', title: '내비', description: '이동·동선', assigneeId: null, assigneeName: null },
  { id: 'role-food', title: '맛집 리서치', description: '식사 후보', assigneeId: null, assigneeName: null },
  { id: 'role-bag', title: '짐 담당', description: '공용 짐·체크', assigneeId: null, assigneeName: null },
];

export const DEFAULT_TODOS: TripTodoItem[] = [
  { id: 'todo-1', title: '숙소 예약 확인', done: false },
  { id: 'todo-2', title: '이동 수단 확정', done: false },
  { id: 'todo-3', title: '공통 짐 목록 공유', done: false },
];

export const DEFAULT_LABOR_CATEGORIES: TripLaborCategory[] = [
  { id: 'labor-plan', title: '여행계획', assigneeId: null },
  { id: 'labor-treasury', title: '총무', assigneeId: null },
  { id: 'labor-photo', title: '사진', assigneeId: null },
  { id: 'labor-mood', title: '분위기', assigneeId: null },
];

type TripInput = Omit<
  Trip,
  'roles' | 'todos' | 'expenses' | 'timeline' | 'laborCategories' | 'laborValues' | 'settlementConfirmed'
> &
  Partial<
    Pick<Trip, 'roles' | 'todos' | 'expenses' | 'timeline' | 'laborCategories' | 'laborValues' | 'settlementConfirmed'>
  >;

export const withTripDefaults = (trip: TripInput): Trip => ({
  ...trip,
  timeline: trip.timeline ?? [],
  roles: trip.roles ?? DEFAULT_ROLES.map((role) => ({ ...role })),
  todos: trip.todos ?? DEFAULT_TODOS.map((todo) => ({ ...todo })),
  expenses: trip.expenses ?? [],
  laborCategories: trip.laborCategories?.length
    ? trip.laborCategories
    : DEFAULT_LABOR_CATEGORIES.map((item) => ({ ...item })),
  laborValues: trip.laborValues ?? [],
  settlementConfirmed: trip.settlementConfirmed ?? false,
});

export const SEED_PAST_TRIPS: Trip[] = [
  withTripDefaults({
    id: 'gangneung-2026',
    title: '강릉 우정여행',
    destination: '강릉',
    dateLabel: '2026.05.02 – 05.04',
    nightsLabel: '2박 3일',
    phase: 'settled',
    memberCount: 4,
    transport: 'car',
    budget: '적당히',
    foods: ['한식'],
    activity: 50,
    inviteCode: 'gachigachi.app/j/gn26',
    totalAmount: '248,000원',
    perPersonAmount: '62,000원',
    expenses: [
      { id: 'exp-1', title: '숙소', amount: 180000, payerName: '도연', createdAt: '2026-05-04T10:00:00.000Z' },
      { id: 'exp-2', title: '식비', amount: 68000, payerName: '서준', createdAt: '2026-05-04T12:00:00.000Z' },
    ],
    members: [
      {
        id: '1',
        name: '도연',
        role: '나 · 호스트',
        member: 'doyeon',
        status: 'host',
        statusLabel: '성향 입력 전',
      },
      { id: '2', name: '서준', role: '친구', member: 'seojun', status: 'done', statusLabel: '완료' },
      { id: '3', name: '하영', role: '친구', member: 'hayeong', status: 'done', statusLabel: '완료' },
      { id: '4', name: '민재', role: '친구', member: 'minjae', status: 'done', statusLabel: '완료' },
    ],
  }),
  withTripDefaults({
    id: 'jeju-2026',
    title: '제주 한 달 살기',
    destination: '제주',
    dateLabel: '2026.03.10 – 03.13',
    nightsLabel: '3박 4일',
    phase: 'settled',
    memberCount: 3,
    transport: 'transit',
    budget: '플렉스',
    foods: ['한식', '일식'],
    activity: 40,
    inviteCode: 'gachigachi.app/j/jj26',
    totalAmount: '512,000원',
    perPersonAmount: '170,600원',
    members: [
      {
        id: '1',
        name: '도연',
        role: '나 · 호스트',
        member: 'doyeon',
        status: 'host',
        statusLabel: '성향 입력 전',
      },
      { id: '2', name: '서준', role: '친구', member: 'seojun', status: 'done', statusLabel: '완료' },
      { id: '3', name: '하영', role: '친구', member: 'hayeong', status: 'done', statusLabel: '완료' },
    ],
  }),
];

export const createInitialSession = (): AppSession => ({
  version: 1,
  isAuthenticated: false,
  isGuest: false,
  hasCompletedOnboarding: false,
  user: DEFAULT_USER,
  draft: null,
  trips: SEED_PAST_TRIPS,
  activeTripId: null,
});

export const normalizeTrip = (trip: Trip): Trip => withTripDefaults(trip);
