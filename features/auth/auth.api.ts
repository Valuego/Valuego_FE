import { queryOptions } from '@tanstack/react-query';

import { apiRequest } from '@/shared/lib/api';

import type { LoginInfo, UserAgreeUpdateRequest, UserProfileResponse } from './auth.types';

import { getKakaoRedirectUri } from './auth.lib';
import { loginInfoSchema, userProfileSchema } from './auth.schemas';

export const authQueryKeys = {
  all: () => ['auth'] as const,
  profile: () => [...authQueryKeys.all(), 'profile'] as const,
};

const parseProfile = (data: UserProfileResponse) => userProfileSchema.parse(data);

export const loginWithKakaoCode = async (code: string): Promise<LoginInfo> => {
  const data = await apiRequest<LoginInfo>(`/login/kakao?code=${encodeURIComponent(code)}`);
  return loginInfoSchema.parse(data);
};

export const loginWithTestAccount = async (): Promise<LoginInfo> => {
  const data = await apiRequest<LoginInfo>('/login/test-account', { method: 'POST' });
  return loginInfoSchema.parse(data);
};

export const logoutRequest = async () => {
  await apiRequest('/login/logout', { method: 'POST', skipAuthRetry: true });
};

export const getUserProfile = async (): Promise<UserProfileResponse> => {
  const data = await apiRequest<UserProfileResponse>('/users/profile');
  return parseProfile(data);
};

export const updateUserAgree = async (body: UserAgreeUpdateRequest): Promise<UserProfileResponse> => {
  const data = await apiRequest<UserProfileResponse>('/users/agree', {
    method: 'PATCH',
    body,
  });
  return parseProfile(data);
};

export const userProfileQueryOptions = queryOptions({
  queryKey: authQueryKeys.profile(),
  queryFn: getUserProfile,
  retry: 0,
  throwOnError: false,
});

export const getKakaoAuthorizeUrl = () => {
  const clientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID?.trim();
  const redirectUri = getKakaoRedirectUri();

  if (!clientId) {
    return null;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'profile_nickname,profile_image,account_email',
  });

  return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
};
