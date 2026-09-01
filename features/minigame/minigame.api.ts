import { queryOptions } from '@tanstack/react-query';

import { apiRequest } from '@/shared/lib/api';

import type { GameMember, GameResult } from './minigame.types';

import { gameMemberListSchema, gameResultSchema } from './minigame.schemas';

export const minigameQueryKeys = {
  all: () => ['minigame'] as const,
  members: (groupId: number) => [...minigameQueryKeys.all(), 'members', groupId] as const,
};

export const getGameMembers = async (groupId: number): Promise<GameMember[]> => {
  const data = await apiRequest<GameMember[]>(`/games/members?groupId=${groupId}`, { method: 'POST' });
  return gameMemberListSchema.parse(data);
};

export const playRoulette = async (groupId: number, penalty: string): Promise<GameResult> => {
  const data = await apiRequest<GameResult>(`/games/roulette?groupId=${groupId}`, {
    method: 'POST',
    body: { penalty },
  });
  return gameResultSchema.parse(data);
};

export const playLadder = async (groupId: number, penalty: string): Promise<GameResult> => {
  const data = await apiRequest<GameResult>(`/games/ladder?groupId=${groupId}`, {
    method: 'POST',
    body: { penalty },
  });
  return gameResultSchema.parse(data);
};

export const gameMembersQueryOptions = (groupId: number) =>
  queryOptions({
    queryKey: minigameQueryKeys.members(groupId),
    queryFn: () => getGameMembers(groupId),
    enabled: Number.isFinite(groupId) && groupId > 0,
    retry: 0,
    throwOnError: false,
  });
