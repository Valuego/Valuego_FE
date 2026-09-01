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
  totalAmount?: string;
  perPersonAmount?: string;
};

export type TripDraft = {
  destination: string;
  dateLabel: string;
  nightsLabel: string;
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
};

export type AppSession = {
  version: 1;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  user: UserProfile;
  draft: TripDraft | null;
  trips: Trip[];
  activeTripId: string | null;
};
