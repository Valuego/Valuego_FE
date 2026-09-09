import { NextResponse } from 'next/server';

import {
  adaptSetCookieForBrowser,
  fetchBackendDirect,
  getBackendApiBase,
  readSetCookies,
} from '@/shared/lib/api/backend-proxy';

const LOGIN_PATH = '/login';
const LOGIN_COMPLETE_PATH = '/login/complete';

const KAKAO_ERROR_MESSAGES: Record<string, string> = {
  access_denied: '카카오 로그인을 취소했어요.',
  KOE006: '카카오에 등록되지 않은 리다이렉트 주소입니다. http://localhost:3000 으로 접속해 주세요.',
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

const fetchKakaoLogin = async (code: string) => {
  const backendBase = getBackendApiBase();
  const backendHost = new URL(backendBase).host;
  let currentUrl = `${backendBase}/api/v1/login/kakao?code=${encodeURIComponent(code)}`;
  const setCookies: string[] = [];

  for (let hop = 0; hop < 5; hop += 1) {
    const response = await fetchBackendDirect({
      url: currentUrl,
      method: 'GET',
      headers: new Headers({ Accept: 'application/json' }),
    });
    setCookies.push(...readSetCookies(response));

    if (response.status < 300 || response.status >= 400) {
      return { response, setCookies };
    }

    const location = response.headers.get('location');
    if (!location) {
      return { response, setCookies };
    }

    const nextUrl = new URL(location, currentUrl);
    if (nextUrl.host.replace(/^www\./, '') !== backendHost.replace(/^www\./, '')) {
      return { response, setCookies };
    }
    currentUrl = nextUrl.toString();
  }

  throw new Error('redirect-loop');
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

  let loginResult: Awaited<ReturnType<typeof fetchKakaoLogin>>;
  try {
    loginResult = await fetchKakaoLogin(code);
  } catch {
    return redirectToLogin(requestUrl.origin, '일시적으로 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.');
  }

  if (!loginResult.response.ok) {
    return redirectToLogin(requestUrl.origin, await readBackendErrorMessage(loginResult.response));
  }

  const setCookies = loginResult.setCookies;
  if (setCookies.length === 0) {
    return redirectToLogin(requestUrl.origin, '로그인 쿠키를 설정하지 못했습니다. 잠시 후 다시 시도해 주세요.');
  }

  const isHttps = requestUrl.protocol === 'https:';
  const redirectResponse = NextResponse.redirect(new URL(LOGIN_COMPLETE_PATH, requestUrl.origin), 303);
  setCookies.forEach((cookie) => {
    redirectResponse.headers.append('Set-Cookie', adaptSetCookieForBrowser(cookie, isHttps));
  });

  return redirectResponse;
};
