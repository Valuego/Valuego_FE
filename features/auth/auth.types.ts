import type { MemberKey, NotificationAgree } from '@/shared/session';

export type MemberColor = 'BLUE' | 'PURPLE' | 'SKYBLUE' | 'ORANGE';

export type LoginInfo = {
  userId: number;
};

export type UserNotificationAgree = NotificationAgree;

export type UserProfileResponse = {
  userId: number;
  nickname: string;
  email: string;
  profileImageUrl?: string | null;
  socialType: string;
  userRole: string;
  memberColor: MemberColor;
  notificationAgree?: UserNotificationAgree | null;
};

export type UserAgreeUpdateRequest = UserNotificationAgree;

export type UserInfoUpdateRequest = {
  nickname: string;
  memberColor: MemberColor;
};

export const MEMBER_COLOR_TO_KEY: Record<MemberColor, MemberKey> = {
  BLUE: 'doyeon',
  PURPLE: 'seojun',
  SKYBLUE: 'hayeong',
  ORANGE: 'minjae',
};
