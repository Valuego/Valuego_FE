import type { AppSession } from './session.types';

import { createInitialSession, DEFAULT_DRAFT, SESSION_STORAGE_KEY, withTripDefaults } from './session.seed';

let memorySession: AppSession = createInitialSession();
let hydrated = false;

const listeners = new Set<() => void>();

const isBrowser = () => typeof window !== 'undefined';

const notify = () => {
  listeners.forEach((listener) => listener());
};

const migrateSession = (parsed: AppSession): AppSession => ({
  ...parsed,
  isGuest: parsed.isGuest ?? false,
  draft: parsed.draft ? { ...DEFAULT_DRAFT, ...parsed.draft } : parsed.draft,
  trips: parsed.trips.map((trip) => withTripDefaults(trip)),
});

const parseSession = (raw: string | null): AppSession | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AppSession;
    if (parsed?.version !== 1) {
      return null;
    }
    return migrateSession(parsed);
  } catch {
    return null;
  }
};

const persist = (session: AppSession) => {
  memorySession = session;
  if (isBrowser()) {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }
  notify();
};

let storageBound = false;

const bindStorageSync = () => {
  if (!isBrowser() || storageBound) {
    return;
  }
  storageBound = true;
  window.addEventListener('storage', (event) => {
    if (event.key !== SESSION_STORAGE_KEY || event.newValue == null) {
      return;
    }
    const next = parseSession(event.newValue);
    if (!next) {
      return;
    }
    memorySession = next;
    notify();
  });
};

export const hydrateSession = () => {
  if (!isBrowser() || hydrated) {
    return;
  }

  const stored = parseSession(window.localStorage.getItem(SESSION_STORAGE_KEY));
  memorySession = stored ?? createInitialSession();
  hydrated = true;
  bindStorageSync();
};

export const getSessionSnapshot = (): AppSession => {
  hydrateSession();
  return memorySession;
};

const SERVER_SNAPSHOT: AppSession = createInitialSession();

export const getServerSnapshot = (): AppSession => SERVER_SNAPSHOT;

export const subscribeSession = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const setSession = (next: AppSession | ((prev: AppSession) => AppSession)) => {
  hydrateSession();
  const resolved = typeof next === 'function' ? next(memorySession) : next;
  if (resolved === memorySession) {
    return;
  }
  persist(resolved);
};

export const resetSessionStore = () => {
  persist(createInitialSession());
};
