import type { UserProfile } from '@/shared/session';

import { MEMBER_COLOR_TO_KEY, type UserProfileResponse } from './auth.types';

export const KAKAO_CALLBACK_PATH = '/api/v1/login/kakao';

export const getKakaoRedirectUri = () => {
  const fromEnv = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    return `${window.location.origin}${KAKAO_CALLBACK_PATH}`;
  }

  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  return `${site}${KAKAO_CALLBACK_PATH}`;
};

export const isKakaoRedirectOriginMismatch = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const registered = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI?.trim();
  if (!registered) {
    return false;
  }

  try {
    return new URL(registered).origin !== window.location.origin;
  } catch {
    return false;
  }
};

export const toSessionUser = (profile: UserProfileResponse): UserProfile => {
  const nickname = profile.nickname?.trim() || '여행자';

  return {
    name: nickname,
    greetingName: nickname.slice(0, 2),
    email: profile.email,
    member: MEMBER_COLOR_TO_KEY[profile.memberColor],
    personalityTitle: '액티비티 러버',
    personalityDescription: '알찬 일정을 좋아하고, 맛집은 꼭 들르는 타입',
    tags: ['#부지런', '#맛집헌터', '#가성비'],
    notificationAgree: profile.notificationAgree ?? undefined,
  };
};
