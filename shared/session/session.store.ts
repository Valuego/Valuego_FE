import type { AppSession } from './session.types';

import { createInitialSession, SESSION_STORAGE_KEY } from './session.seed';

let memorySession: AppSession = createInitialSession();
let hydrated = false;

const listeners = new Set<() => void>();

const isBrowser = () => typeof window !== 'undefined';

const notify = () => {
  listeners.forEach((listener) => listener());
};

const parseSession = (raw: string | null): AppSession | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AppSession;
    if (parsed?.version !== 1) {
      return null;
    }
    return parsed;
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

export const hydrateSession = () => {
  if (!isBrowser() || hydrated) {
    return;
  }

  const stored = parseSession(window.localStorage.getItem(SESSION_STORAGE_KEY));
  memorySession = stored ?? createInitialSession();
  hydrated = true;
};

export const getSessionSnapshot = (): AppSession => {
  hydrateSession();
  return memorySession;
};

export const getServerSnapshot = (): AppSession => createInitialSession();

export const subscribeSession = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const setSession = (next: AppSession | ((prev: AppSession) => AppSession)) => {
  hydrateSession();
  const resolved = typeof next === 'function' ? next(memorySession) : next;
  persist(resolved);
};

export const resetSessionStore = () => {
  persist(createInitialSession());
};
