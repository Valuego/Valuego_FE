import { z } from 'zod';

export const gameMemberSchema = z.object({
  groupMemberId: z.number(),
  memberName: z.string(),
});

export const gameMemberListSchema = z.array(gameMemberSchema);

export const gameMemberResultSchema = z.object({
  groupMemberId: z.number(),
  nickname: z.string(),
  result: z.string(),
});

export const gameResultSchema = z.object({
  gameId: z.number(),
  groupId: z.number(),
  gameType: z.enum(['LADDER', 'ROULETTE', 'QUIZ']),
  penalty: z.string(),
  result: z.array(gameMemberResultSchema),
});
