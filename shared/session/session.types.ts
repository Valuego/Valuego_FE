export type MemberKey = 'doyeon' | 'seojun' | 'hayeong' | 'minjae';

export type TripPhase = 'drafting' | 'inviting' | 'planning' | 'ongoing' | 'settling' | 'settled';

export type Transport = 'car' | 'transit';

export type TripMemberStatus = 'host' | 'done' | 'pending';

export type TripMember = {
  id: string;
  name: string;
  role: string;
  member: MemberKey;
  status: TripMemberStatus;
  statusLabel: string;
};

export type GameResult = {
  id: string;
  game: 'roulette' | 'ladder';
  winnerKey: MemberKey;
  winnerName: string;
  createdAt: string;
  label: string;
};

export type TripRoleItem = {
  id: string;
  title: string;
  description: string;
  assigneeId: string | null;
  assigneeName: string | null;
};

export type TripTodoItem = {
  id: string;
  title: string;
  done: boolean;
};

export type TripExpense = {
  id: string;
  title: string;
  amount: number;
  payerName: string;
  createdAt: string;
};

export type Trip = {
  id: string;
  title: string;
  destination: string;
  dateLabel: string;
  nightsLabel: string;
  phase: TripPhase;
  dDayLabel?: string;
  memberCount: number;
  transport: Transport;
  budget: string;
  foods: string[];
  activity: number;
  members: TripMember[];
  inviteCode: string;
  timeline: GameResult[];
  roles: TripRoleItem[];
  todos: TripTodoItem[];
  expenses: TripExpense[];
  totalAmount?: string;
  perPersonAmount?: string;
};

export type NotificationAgree = {
  notifyComments: boolean;
  notifyReminders: boolean;
  notifySettlement: boolean;
  notifyMarketing: boolean;
};

export type TripDraft = {
  destination: string;
  dateLabel: string;
  nightsLabel: string;
  startDate: string;
  endDate: string;
  memberCount: number;
  transport: Transport;
  budget: string;
  foods: string[];
  activity: number;
};

export type UserProfile = {
  name: string;
  greetingName: string;
  email: string;
  member: MemberKey;
  personalityTitle: string;
  personalityDescription: string;
  tags: string[];
  notificationAgree?: NotificationAgree;
};

export type AppSession = {
  version: 1;
  isAuthenticated: boolean;
  isGuest: boolean;
  hasCompletedOnboarding: boolean;
  user: UserProfile;
  draft: TripDraft | null;
  trips: Trip[];
  activeTripId: string | null;
};
