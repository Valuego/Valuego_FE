'use client';

import { useMemo, useSyncExternalStore } from 'react';

import type { AppSession, Trip } from './session.types';

import { withTripDefaults } from './session.seed';
import { getServerSnapshot, getSessionSnapshot, subscribeSession } from './session.store';

export const useAppSession = (): AppSession => {
  return useSyncExternalStore(subscribeSession, getSessionSnapshot, getServerSnapshot);
};

export const useActiveTrip = (): Trip | null => {
  const session = useAppSession();
  const trip = session.activeTripId ? session.trips.find((item) => item.id === session.activeTripId) : undefined;
  return useMemo(() => (trip ? withTripDefaults(trip) : null), [trip]);
};

export const useTripDraft = () => {
  const session = useAppSession();
  return session.draft;
};

export const useTripById = (tripId: string): Trip | null => {
  const session = useAppSession();
  const decoded = useMemo(() => {
    try {
      return decodeURIComponent(tripId);
    } catch {
      return tripId;
    }
  }, [tripId]);
  const trip = session.trips.find(
    (item) => item.id === tripId || item.id === decoded || item.inviteCode === tripId || item.inviteCode === decoded,
  );
  return useMemo(() => (trip ? withTripDefaults(trip) : null), [trip]);
};

export const useSettledTrips = (): Trip[] => {
  const session = useAppSession();
  return session.trips.filter((trip) => trip.phase === 'settled').map((trip) => withTripDefaults(trip));
};
