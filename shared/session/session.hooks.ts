'use client';

import { useSyncExternalStore } from 'react';

import type { AppSession, Trip } from './session.types';

import { getServerSnapshot, getSessionSnapshot, subscribeSession } from './session.store';

export const useAppSession = (): AppSession => {
  return useSyncExternalStore(subscribeSession, getSessionSnapshot, getServerSnapshot);
};

export const useActiveTrip = (): Trip | null => {
  const session = useAppSession();
  if (!session.activeTripId) {
    return null;
  }
  return session.trips.find((trip) => trip.id === session.activeTripId) ?? null;
};

export const useTripDraft = () => {
  const session = useAppSession();
  return session.draft;
};

export const useTripById = (tripId: string): Trip | null => {
  const session = useAppSession();
  return session.trips.find((trip) => trip.id === tripId) ?? null;
};

export const useSettledTrips = (): Trip[] => {
  const session = useAppSession();
  return session.trips.filter((trip) => trip.phase === 'settled');
};
