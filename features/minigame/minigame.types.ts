export type GameType = 'LADDER' | 'ROULETTE' | 'QUIZ';

export type GameMember = {
  groupMemberId: number;
  memberName: string;
};

export type GameMemberResult = {
  groupMemberId: number;
  nickname: string;
  result: string;
};

export type GameResult = {
  gameId: number;
  groupId: number;
  gameType: GameType;
  penalty: string;
  result: GameMemberResult[];
};
