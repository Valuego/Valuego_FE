import type {
  GameResult,
  MemberKey,
  Trip,
  TripDraft,
  TripExpense,
  TripMember,
  TripPhase,
  UserProfile,
} from './session.types';

import {
  createInitialSession,
  DEFAULT_DRAFT,
  DEFAULT_LABOR_CATEGORIES,
  DEFAULT_ROLES,
  DEFAULT_TODOS,
  DEMO_GUEST_INVITE_CODE,
  createDemoGuestTrip,
  withTripDefaults,
} from './session.seed';
import { getSessionSnapshot, resetSessionStore, setSession } from './session.store';

const FRIEND_POOL: Omit<TripMember, 'id'>[] = [
  { name: '서준', role: '친구', member: 'seojun', status: 'done', statusLabel: '완료' },
  { name: '하영', role: '친구', member: 'hayeong', status: 'done', statusLabel: '완료' },
  { name: '민재', role: '친구', member: 'minjae', status: 'pending', statusLabel: '대기 중' },
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
  statusLabel: '성향 입력 전',
});

export const normalizeInviteInput = (raw: string) => {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) {
    return '';
  }
  const withoutProtocol = trimmed.replace(/^https?:\/\//, '');
  const parts = withoutProtocol.split('/');
  return parts[parts.length - 1] ?? withoutProtocol;
};

export const login = () => {
  setSession((prev) => ({
    ...prev,
    isAuthenticated: true,
  }));
};

export const applyAuthenticatedUser = (user: UserProfile) => {
  setSession((prev) => ({
    ...prev,
    isAuthenticated: true,
    isGuest: false,
    user,
  }));
};

export const enterGuestSession = (trip: Trip) => {
  setSession((prev) => ({
    ...prev,
    isGuest: true,
    isAuthenticated: false,
    activeTripId: trip.id,
    trips: [trip, ...prev.trips.filter((item) => item.id !== trip.id)],
  }));
};

const INVITE_MEMBER_KEYS: MemberKey[] = ['seojun', 'hayeong', 'minjae', 'doyeon'];

const isPendingInvitee = (member: TripMember) => {
  return member.statusLabel === '대기 중' || member.id.startsWith('invite-pending-');
};

export const isDemoInviteCode = (rawCode: string) => {
  return normalizeInviteInput(rawCode) === DEMO_GUEST_INVITE_CODE;
};

export const seedPendingInvitees = (tripId: string) => {
  setSession((prev) => ({
    ...prev,
    trips: prev.trips.map((trip) => {
      if (trip.id !== tripId) {
        return trip;
      }
      const missing = Math.max(0, trip.memberCount - trip.members.length);
      if (missing === 0) {
        return trip;
      }
      const used = new Set(trip.members.map((item) => item.member));
      const extras: TripMember[] = [];
      for (let index = 0; index < missing; index += 1) {
        const member =
          INVITE_MEMBER_KEYS.find((key) => !used.has(key) && extras.every((item) => item.member !== key)) ??
          INVITE_MEMBER_KEYS[index % INVITE_MEMBER_KEYS.length];
        extras.push({
          id: `invite-pending-${trip.id}-${index}`,
          name: '친구',
          role: '친구',
          member,
          status: 'pending',
          statusLabel: '대기 중',
        });
      }
      return withTripDefaults({
        ...trip,
        members: [...trip.members, ...extras],
        dDayLabel: trip.dDayLabel ?? '일행 대기 중',
      });
    }),
  }));
};

export const acceptInviteFromLink = (rawCode: string, guest?: { name?: string; member?: MemberKey }) => {
  const token = normalizeInviteInput(rawCode);
  if (!token) {
    return null;
  }

  let nextTrip: Trip | null = null;
  setSession((prev) => {
    const trip = prev.trips.find((item) => normalizeInviteInput(item.inviteCode) === token);
    if (!trip) {
      return prev;
    }

    const pendingIndex = trip.members.findIndex((member) => isPendingInvitee(member));
    const guestName = guest?.name?.trim();
    let members = trip.members;

    if (pendingIndex >= 0) {
      members = trip.members.map((member, index) => {
        if (index !== pendingIndex) {
          return member;
        }
        return {
          ...member,
          id: member.id.startsWith('invite-pending-') ? `invite-guest-${index}` : member.id,
          name: guestName || (member.name === '친구' ? '친구' : member.name),
          role: guestName ? '나' : member.role,
          member: guest?.member ?? member.member,
          status: 'done' as const,
          statusLabel: '완료',
        };
      });
    } else if (guestName && trip.members.length < trip.memberCount) {
      const memberKey = guest?.member ?? 'seojun';
      members = [
        ...trip.members,
        {
          id: `invite-guest-${trip.members.length}`,
          name: guestName,
          role: '나',
          member: memberKey,
          status: 'done',
          statusLabel: '완료',
        },
      ];
    } else {
      nextTrip = trip;
      return prev;
    }

    nextTrip = withTripDefaults({ ...trip, members });
    return {
      ...prev,
      trips: prev.trips.map((item) => (item.id === trip.id ? nextTrip! : item)),
    };
  });

  return nextTrip;
};

export const enterDemoGuestSession = (guestName?: string, member?: MemberKey) => {
  const existing = getSessionSnapshot().trips.find(
    (trip) => trip.id === 'demo-guest-trip' || normalizeInviteInput(trip.inviteCode) === DEMO_GUEST_INVITE_CODE,
  );

  if (guestName) {
    const trip =
      acceptInviteFromLink(existing?.inviteCode ?? DEMO_GUEST_INVITE_CODE, { name: guestName, member }) ??
      createDemoGuestTrip(guestName, member);
    enterGuestSession(trip);
    return trip;
  }

  const trip = existing ?? createDemoGuestTrip();
  enterGuestSession(trip);
  return trip;
};

export const signOutSession = () => {
  setSession((prev) => ({
    ...createInitialSession(),
    hasCompletedOnboarding: prev.hasCompletedOnboarding,
  }));
};

export const setActiveTripId = (tripId: string | null) => {
  setSession((prev) => ({
    ...prev,
    activeTripId: tripId,
  }));
};

export const upsertLocalTrip = (trip: Trip) => {
  setSession((prev) => ({
    ...prev,
    activeTripId: trip.id,
    trips: [trip, ...prev.trips.filter((item) => item.id !== trip.id)],
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

  const trip = withTripDefaults({
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
    members: [hostMember(session.user.greetingName, session.user.member)],
    roles: DEFAULT_ROLES.map((role) =>
      role.id === 'role-host' ? { ...role, assigneeId: 'host', assigneeName: session.user.greetingName } : { ...role },
    ),
    todos: DEFAULT_TODOS.map((todo) => ({ ...todo })),
    expenses: [],
  });

  setSession((prev) => ({
    ...prev,
    draft: null,
    activeTripId: trip.id,
    trips: [trip, ...prev.trips.filter((item) => item.id !== trip.id)],
  }));

  return trip;
};

export const getTripById = (tripId: string) => {
  const trip = getSessionSnapshot().trips.find((item) => item.id === tripId);
  return trip ? withTripDefaults(trip) : undefined;
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

      return withTripDefaults({
        ...trip,
        members: [hostMember(prev.user.greetingName, prev.user.member), ...friends],
        phase: 'planning',
        dDayLabel: '일정 준비 중',
      });
    }),
  }));
};

export const joinTripByCode = (rawCode: string): { ok: true; trip: Trip } | { ok: false; reason: string } => {
  const token = normalizeInviteInput(rawCode);
  if (!token) {
    return { ok: false, reason: '참여 코드를 입력해 주세요.' };
  }

  const session = getSessionSnapshot();
  const matched = session.trips.find((trip) => normalizeInviteInput(trip.inviteCode) === token);

  if (!matched) {
    return { ok: false, reason: '코드를 찾을 수 없어요. 다시 확인해 주세요.' };
  }

  const alreadyJoined = matched.members.some(
    (member) => member.member === session.user.member || member.name === session.user.greetingName,
  );

  const nextMembers = alreadyJoined
    ? matched.members
    : [
        ...matched.members,
        {
          id: `member-${session.user.member}`,
          name: session.user.greetingName,
          role: '친구',
          member: session.user.member,
          status: 'done' as const,
          statusLabel: '완료',
        },
      ];

  const nextTrip = withTripDefaults({
    ...matched,
    members: nextMembers,
    phase: matched.phase === 'settled' ? matched.phase : 'planning',
    dDayLabel: matched.phase === 'settled' ? matched.dDayLabel : '일행 대기 중',
  });

  setSession((prev) => ({
    ...prev,
    activeTripId: nextTrip.id,
    trips: prev.trips.map((trip) => (trip.id === nextTrip.id ? nextTrip : trip)),
  }));

  return { ok: true, trip: nextTrip };
};

export const advanceTripPhase = (tripId: string, phase: TripPhase) => {
  setSession((prev) => ({
    ...prev,
    activeTripId: phase === 'settled' ? (prev.activeTripId === tripId ? null : prev.activeTripId) : tripId,
    trips: prev.trips.map((trip) => {
      if (trip.id !== tripId) {
        return trip;
      }

      const next = withTripDefaults({
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
      });

      if (phase === 'settled' && !next.totalAmount) {
        const sum = next.expenses.reduce((acc, item) => acc + item.amount, 0);
        const per = next.members.length > 0 ? Math.round(sum / next.members.length) : 0;
        next.totalAmount = sum > 0 ? `${sum.toLocaleString('ko-KR')}원` : '330,000원';
        next.perPersonAmount = sum > 0 ? `${per.toLocaleString('ko-KR')}원` : '82,500원';
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
      return withTripDefaults({
        ...trip,
        timeline: [entry, ...trip.timeline],
      });
    }),
  }));

  return entry;
};

export const assignTripRole = (tripId: string, roleId: string, memberId: string | null) => {
  setSession((prev) => ({
    ...prev,
    trips: prev.trips.map((trip) => {
      if (trip.id !== tripId) {
        return trip;
      }
      const assignee = trip.members.find((member) => member.id === memberId);
      return withTripDefaults({
        ...trip,
        roles: trip.roles.map((role) =>
          role.id === roleId
            ? {
                ...role,
                assigneeId: memberId,
                assigneeName: assignee?.name ?? null,
              }
            : role,
        ),
      });
    }),
  }));
};

export const toggleTripTodo = (tripId: string, todoId: string) => {
  setSession((prev) => ({
    ...prev,
    trips: prev.trips.map((trip) => {
      if (trip.id !== tripId) {
        return trip;
      }
      return withTripDefaults({
        ...trip,
        todos: trip.todos.map((todo) => (todo.id === todoId ? { ...todo, done: !todo.done } : todo)),
      });
    }),
  }));
};

export const addTripTodo = (tripId: string, title: string) => {
  const trimmed = title.trim();
  if (!trimmed) {
    return;
  }

  setSession((prev) => ({
    ...prev,
    trips: prev.trips.map((trip) => {
      if (trip.id !== tripId) {
        return trip;
      }
      return withTripDefaults({
        ...trip,
        todos: [...trip.todos, { id: `todo-${Date.now().toString(36)}`, title: trimmed, done: false }],
      });
    }),
  }));
};

export const addTripExpense = (tripId: string, input: { title: string; amount: number; payerName: string }) => {
  const expense: TripExpense = {
    id: `exp-${Date.now().toString(36)}`,
    title: input.title.trim(),
    amount: input.amount,
    payerName: input.payerName,
    createdAt: new Date().toISOString(),
  };

  if (!expense.title || expense.amount <= 0) {
    return;
  }

  setSession((prev) => ({
    ...prev,
    trips: prev.trips.map((trip) => {
      if (trip.id !== tripId) {
        return trip;
      }
      const expenses = [expense, ...trip.expenses];
      const sum = expenses.reduce((acc, item) => acc + item.amount, 0);
      const per = trip.members.length > 0 ? Math.round(sum / trip.members.length) : 0;
      return withTripDefaults({
        ...trip,
        expenses,
        totalAmount: `${sum.toLocaleString('ko-KR')}원`,
        perPersonAmount: `${per.toLocaleString('ko-KR')}원`,
      });
    }),
  }));
};

export const assignLaborMember = (tripId: string, categoryId: string, memberId: string | null) => {
  setSession((prev) => ({
    ...prev,
    trips: prev.trips.map((trip) => {
      if (trip.id !== tripId) {
        return trip;
      }
      const categories = trip.laborCategories.length
        ? trip.laborCategories
        : DEFAULT_LABOR_CATEGORIES.map((item) => ({ ...item }));
      return withTripDefaults({
        ...trip,
        laborCategories: categories.map((item) => (item.id === categoryId ? { ...item, assigneeId: memberId } : item)),
      });
    }),
  }));
};

export const addLaborCategory = (tripId: string, title: string) => {
  const trimmed = title.trim();
  if (!trimmed) {
    return;
  }

  setSession((prev) => ({
    ...prev,
    trips: prev.trips.map((trip) => {
      if (trip.id !== tripId) {
        return trip;
      }
      return withTripDefaults({
        ...trip,
        laborCategories: [
          ...trip.laborCategories,
          { id: `labor-${Date.now().toString(36)}`, title: trimmed, assigneeId: null },
        ],
      });
    }),
  }));
};

export const removeLaborCategory = (tripId: string, categoryId: string) => {
  setSession((prev) => ({
    ...prev,
    trips: prev.trips.map((trip) => {
      if (trip.id !== tripId) {
        return trip;
      }
      return withTripDefaults({
        ...trip,
        laborCategories: trip.laborCategories.filter((item) => item.id !== categoryId),
      });
    }),
  }));
};

export const saveLaborValue = (tripId: string, memberId: string, amount: number, note: string) => {
  setSession((prev) => ({
    ...prev,
    trips: prev.trips.map((trip) => {
      if (trip.id !== tripId) {
        return trip;
      }
      const nextValues = trip.laborValues.filter((item) => item.memberId !== memberId);
      nextValues.push({ memberId, amount, note });
      return withTripDefaults({
        ...trip,
        laborValues: nextValues,
      });
    }),
  }));
};

export const confirmSettlementBoard = (tripId: string) => {
  setSession((prev) => ({
    ...prev,
    trips: prev.trips.map((trip) => {
      if (trip.id !== tripId) {
        return trip;
      }
      return withTripDefaults({
        ...trip,
        settlementConfirmed: true,
      });
    }),
  }));
};

export const resetDemo = () => {
  resetSessionStore();
};
