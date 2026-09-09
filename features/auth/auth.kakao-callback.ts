import { NextResponse } from 'next/server';

const LOGIN_PATH = '/login';

const KAKAO_ERROR_MESSAGES: Record<string, string> = {
  access_denied: '카카오 로그인을 취소했어요.',
};

const getBackendApiBase = () => {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '');
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

const readSetCookies = (response: Response) => {
  if (typeof response.headers.getSetCookie === 'function') {
    const cookies = response.headers.getSetCookie();
    if (cookies.length > 0) {
      return cookies;
    }
  }

  const combined = response.headers.get('set-cookie');
  return combined ? [combined] : [];
};

const toBrowserCookie = (setCookie: string, isHttps: boolean) => {
  if (isHttps) {
    return setCookie;
  }

  let cookie = setCookie.replace(/;\s*Secure/gi, '');
  if (/SameSite=None/i.test(cookie)) {
    cookie = cookie.replace(/SameSite=None/gi, 'SameSite=Lax');
  }
  return cookie;
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
    redirectResponse.headers.append('Set-Cookie', toBrowserCookie(cookie, isHttps));
  });

  return redirectResponse;
};
