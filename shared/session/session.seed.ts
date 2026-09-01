import type { AppSession, Trip, TripDraft, UserProfile } from './session.types';

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
  dateLabel: '2026.06.20 – 06.22',
  nightsLabel: '2박 3일',
  memberCount: 4,
  transport: 'car',
  budget: '적당히',
  foods: ['한식', '중식'],
  activity: 52,
};

export const SEED_PAST_TRIPS: Trip[] = [
  {
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
    timeline: [],
    members: [
      {
        id: '1',
        name: '도연',
        role: '나 · 호스트',
        member: 'doyeon',
        status: 'host',
        statusLabel: '성향 완료',
      },
      { id: '2', name: '서준', role: '친구', member: 'seojun', status: 'done', statusLabel: '완료' },
      { id: '3', name: '하영', role: '친구', member: 'hayeong', status: 'done', statusLabel: '완료' },
      { id: '4', name: '민재', role: '친구', member: 'minjae', status: 'done', statusLabel: '완료' },
    ],
  },
  {
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
    timeline: [],
    members: [
      {
        id: '1',
        name: '도연',
        role: '나 · 호스트',
        member: 'doyeon',
        status: 'host',
        statusLabel: '성향 완료',
      },
      { id: '2', name: '서준', role: '친구', member: 'seojun', status: 'done', statusLabel: '완료' },
      { id: '3', name: '하영', role: '친구', member: 'hayeong', status: 'done', statusLabel: '완료' },
    ],
  },
];

export const createInitialSession = (): AppSession => ({
  version: 1,
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  user: DEFAULT_USER,
  draft: null,
  trips: SEED_PAST_TRIPS,
  activeTripId: null,
});
