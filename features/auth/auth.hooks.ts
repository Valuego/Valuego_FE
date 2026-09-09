'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { getQueryClient } from '@/shared/lib/get-query-client';
import { applyAuthenticatedUser, signOutSession, useAppSession } from '@/shared/session';

import type { UserAgreeUpdateRequest, UserInfoUpdateRequest, UserProfileResponse } from './auth.types';

import {
  authQueryKeys,
  getKakaoAuthorizeUrl,
  loginWithTestAccount,
  logoutRequest,
  updateUserAgree,
  updateUserProfile,
  userProfileQueryOptions,
} from './auth.api';
import { toSessionUser } from './auth.lib';

export const useUserProfileQuery = (enabled = true) => {
  return useQuery({
    ...userProfileQueryOptions,
    enabled,
  });
};

export const useAuthStatus = () => {
  const session = useAppSession();
  const profileQuery = useUserProfileQuery(!session.isGuest);

  useEffect(() => {
    if (!profileQuery.data) {
      return;
    }
    applyAuthenticatedUser(toSessionUser(profileQuery.data));
  }, [profileQuery.data]);

  const isBootstrapping = session.isGuest
    ? false
    : !profileQuery.data && (profileQuery.isPending || profileQuery.isFetching);
  const isAuthenticated = session.isGuest ? false : Boolean(profileQuery.data);

  return {
    isBootstrapping,
    isAuthenticated,
    isGuest: session.isGuest,
    hasCompletedOnboarding: session.hasCompletedOnboarding,
    profile: profileQuery.data,
    session,
    profileQuery,
  };
};

export const useLoginWithTestAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginWithTestAccount,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.profile() });
      const profile = await queryClient.fetchQuery(userProfileQueryOptions);
      applyAuthenticatedUser(toSessionUser(profile));
    },
  });
};

export const startKakaoLogin = () => {
  const authorizeUrl = getKakaoAuthorizeUrl();
  if (!authorizeUrl) {
    throw new Error('카카오 로그인 설정이 없습니다. NEXT_PUBLIC_KAKAO_CLIENT_ID를 확인해 주세요.');
  }
  window.location.assign(authorizeUrl);
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      signOutSession();
      queryClient.clear();
    },
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UserInfoUpdateRequest) => updateUserProfile(body),
    onSuccess: (profile) => {
      queryClient.setQueryData(authQueryKeys.profile(), profile);
      applyAuthenticatedUser(toSessionUser(profile));
    },
  });
};

export const useUpdateNotificationAgree = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UserAgreeUpdateRequest) => updateUserAgree(body),
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey: authQueryKeys.profile() });
      const previous = queryClient.getQueryData(authQueryKeys.profile());
      queryClient.setQueryData(authQueryKeys.profile(), (current: UserProfileResponse | undefined) => {
        if (!current) {
          return current;
        }
        return { ...current, notificationAgree: body };
      });
      return { previous };
    },
    onError: (_error, _body, context) => {
      if (context?.previous) {
        queryClient.setQueryData(authQueryKeys.profile(), context.previous);
      }
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(authQueryKeys.profile(), profile);
      applyAuthenticatedUser(toSessionUser(profile));
    },
  });
};

export const prefetchUserProfile = () => {
  const queryClient = getQueryClient();
  return queryClient.prefetchQuery(userProfileQueryOptions);
};
