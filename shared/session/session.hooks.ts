'use client';

import { useSyncExternalStore } from 'react';

import type { AppSession, Trip } from './session.types';

import { withTripDefaults } from './session.seed';
import { getServerSnapshot, getSessionSnapshot, subscribeSession } from './session.store';

export const useAppSession = (): AppSession => {
  return useSyncExternalStore(subscribeSession, getSessionSnapshot, getServerSnapshot);
};

export const useActiveTrip = (): Trip | null => {
  const session = useAppSession();
  if (!session.activeTripId) {
    return null;
  }
  const trip = session.trips.find((item) => item.id === session.activeTripId);
  return trip ? withTripDefaults(trip) : null;
};

export const useTripDraft = () => {
  const session = useAppSession();
  return session.draft;
};

export const useTripById = (tripId: string): Trip | null => {
  const session = useAppSession();
  const trip = session.trips.find((item) => item.id === tripId);
  return trip ? withTripDefaults(trip) : null;
};

export const useSettledTrips = (): Trip[] => {
  const session = useAppSession();
  return session.trips.filter((trip) => trip.phase === 'settled').map((trip) => withTripDefaults(trip));
};
