import type { GameResult, MemberKey, Trip, TripDraft, TripMember, TripPhase } from './session.types';

import { DEFAULT_DRAFT } from './session.seed';
import { getSessionSnapshot, resetSessionStore, setSession } from './session.store';

const FRIEND_POOL: Omit<TripMember, 'id'>[] = [
  { name: '서준', role: '친구', member: 'seojun', status: 'done', statusLabel: '완료' },
  { name: '하영', role: '친구', member: 'hayeong', status: 'done', statusLabel: '완료' },
  { name: '민재', role: '친구', member: 'minjae', status: 'pending', statusLabel: '대기중' },
];

const slugifyDestination = (destination: string) => {
  const map: Record<string, string> = {
    부산: 'busan',
    강릉: 'gangneung',
    경주: 'gyeongju',
    여수: 'yeosu',
    전주: 'jeonju',
    속초: 'sokcho',
  };
  return map[destination] ?? 'trip';
};

const createInviteCode = () => {
  const token = Math.random().toString(36).slice(2, 6);
  return `gachigachi.app/j/${token}`;
};

const hostMember = (greetingName: string, member: MemberKey): TripMember => ({
  id: 'host',
  name: greetingName,
  role: '나 · 호스트',
  member,
  status: 'host',
  statusLabel: '성향 완료',
});

export const login = () => {
  setSession((prev) => ({
    ...prev,
    isAuthenticated: true,
  }));
};

export const completeOnboarding = () => {
  setSession((prev) => ({
    ...prev,
    isAuthenticated: true,
    hasCompletedOnboarding: true,
  }));
};

export const startTripDraft = (partial?: Partial<TripDraft>) => {
  setSession((prev) => ({
    ...prev,
    draft: {
      ...(prev.draft ?? DEFAULT_DRAFT),
      ...partial,
    },
  }));
};

export const updateTripDraft = (partial: Partial<TripDraft>) => {
  setSession((prev) => ({
    ...prev,
    draft: {
      ...(prev.draft ?? DEFAULT_DRAFT),
      ...partial,
    },
  }));
};

export const createTripFromDraft = (): Trip => {
  const session = getSessionSnapshot();
  const draft = session.draft ?? DEFAULT_DRAFT;
  const id = `${slugifyDestination(draft.destination)}-${Date.now().toString(36)}`;

  const trip: Trip = {
    id,
    title: `${draft.destination} 우정여행`,
    destination: draft.destination,
    dateLabel: draft.dateLabel,
    nightsLabel: draft.nightsLabel,
    phase: 'inviting',
    dDayLabel: '초대 중',
    memberCount: draft.memberCount,
    transport: draft.transport,
    budget: draft.budget,
    foods: draft.foods,
    activity: draft.activity,
    inviteCode: createInviteCode(),
    timeline: [],
    members: [hostMember(session.user.greetingName, session.user.member)],
  };

  setSession((prev) => ({
    ...prev,
    draft: null,
    activeTripId: trip.id,
    trips: [trip, ...prev.trips.filter((item) => item.id !== trip.id)],
  }));

  return trip;
};

export const getTripById = (tripId: string) => {
  return getSessionSnapshot().trips.find((trip) => trip.id === tripId);
};

export const joinMembersDemo = (tripId: string) => {
  setSession((prev) => ({
    ...prev,
    trips: prev.trips.map((trip) => {
      if (trip.id !== tripId) {
        return trip;
      }

      const friends = FRIEND_POOL.slice(0, Math.max(0, trip.memberCount - 1)).map((friend, index) => ({
        ...friend,
        id: `friend-${index + 1}`,
      }));

      return {
        ...trip,
        members: [hostMember(prev.user.greetingName, prev.user.member), ...friends],
        phase: 'planning' as TripPhase,
        dDayLabel: '일정 준비 중',
      };
    }),
  }));
};

export const advanceTripPhase = (tripId: string, phase: TripPhase) => {
  setSession((prev) => ({
    ...prev,
    activeTripId: phase === 'settled' ? (prev.activeTripId === tripId ? null : prev.activeTripId) : tripId,
    trips: prev.trips.map((trip) => {
      if (trip.id !== tripId) {
        return trip;
      }

      const next: Trip = {
        ...trip,
        phase,
        dDayLabel:
          phase === 'ongoing'
            ? '진행 중 · D-1'
            : phase === 'planning'
              ? '일정 준비 중'
              : phase === 'inviting'
                ? '초대 중'
                : phase === 'settling'
                  ? '정산 중'
                  : undefined,
      };

      if (phase === 'settled' && !next.totalAmount) {
        next.totalAmount = '330,000원';
        next.perPersonAmount = '82,500원';
      }

      return next;
    }),
  }));
};

export const recordGameResult = (tripId: string, result: Omit<GameResult, 'id' | 'createdAt'>) => {
  const entry: GameResult = {
    ...result,
    id: `game-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  };

  setSession((prev) => ({
    ...prev,
    trips: prev.trips.map((trip) => {
      if (trip.id !== tripId) {
        return trip;
      }
      return {
        ...trip,
        timeline: [entry, ...trip.timeline],
      };
    }),
  }));

  return entry;
};

export const resetDemo = () => {
  resetSessionStore();
};
