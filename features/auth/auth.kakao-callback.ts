import { NextResponse } from 'next/server';

import { adaptSetCookieForBrowser, getBackendApiBase, readSetCookies } from '@/shared/lib/api/backend-proxy';

const LOGIN_PATH = '/login';

const KAKAO_ERROR_MESSAGES: Record<string, string> = {
  access_denied: '카카오 로그인을 취소했어요.',
};

const toUserFacingKakaoError = (raw: string) => {
  const trimmed = raw.trim();
  return KAKAO_ERROR_MESSAGES[trimmed] ?? trimmed;
};

const readBackendErrorMessage = async (response: Response) => {
  try {
    const json = (await response.json()) as { message?: string };
    if (json.message?.trim()) {
      return json.message;
    }
  } catch {
    return '카카오 로그인에 실패했어요.';
  }
  return '카카오 로그인에 실패했어요.';
};

const redirectToLogin = (origin: string, message: string) => {
  const loginUrl = new URL(LOGIN_PATH, origin);
  loginUrl.searchParams.set('kakaoError', toUserFacingKakaoError(message));
  return NextResponse.redirect(loginUrl);
};

export const handleKakaoOAuthCallback = async (request: Request) => {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const oauthError = requestUrl.searchParams.get('error_description') ?? requestUrl.searchParams.get('error');

  if (oauthError) {
    return redirectToLogin(requestUrl.origin, oauthError);
  }
  if (!code) {
    return redirectToLogin(requestUrl.origin, '카카오 인가 코드가 없습니다. 다시 로그인해 주세요.');
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${getBackendApiBase()}/api/v1/login/kakao?code=${encodeURIComponent(code)}`, {
      method: 'GET',
      cache: 'no-store',
      redirect: 'manual',
      headers: { Accept: 'application/json' },
    });
  } catch {
    return redirectToLogin(requestUrl.origin, '일시적으로 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.');
  }

  if (!backendResponse.ok) {
    return redirectToLogin(requestUrl.origin, await readBackendErrorMessage(backendResponse));
  }

  const cookies = readSetCookies(backendResponse);
  if (cookies.length === 0) {
    return redirectToLogin(requestUrl.origin, '로그인 쿠키를 설정하지 못했습니다. 잠시 후 다시 시도해 주세요.');
  }

  const isHttps = requestUrl.protocol === 'https:';
  const redirectResponse = NextResponse.redirect(new URL('/', requestUrl.origin));
  cookies.forEach((cookie) => {
    redirectResponse.headers.append('Set-Cookie', adaptSetCookieForBrowser(cookie, isHttps));
  });

  return redirectResponse;
};
