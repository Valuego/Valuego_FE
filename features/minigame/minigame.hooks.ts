'use client';

import { useMutation, useQuery } from '@tanstack/react-query';

import { gameMembersQueryOptions, playLadder, playRoulette } from './minigame.api';
import { parseGroupId } from './minigame.lib';

export const useGameMembersQuery = (tripId?: string) => {
  const groupId = tripId ? (parseGroupId(tripId) ?? 0) : 0;
  return useQuery(gameMembersQueryOptions(groupId));
};

export const usePlayRoulette = (groupId: number) => {
  return useMutation({
    mutationFn: (penalty: string) => playRoulette(groupId, penalty),
  });
};

export const usePlayLadder = (groupId: number) => {
  return useMutation({
    mutationFn: (penalty: string) => playLadder(groupId, penalty),
  });
};
