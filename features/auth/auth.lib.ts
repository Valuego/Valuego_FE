import type { UserProfile } from '@/shared/session';

import { MEMBER_COLOR_TO_KEY, type UserProfileResponse } from './auth.types';

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
