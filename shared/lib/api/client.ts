import { ApiError, type ApiErrorData } from './error';

export type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  skipAuthRetry?: boolean;
};

// 서버에서는 Next.js 프록시 rewrite를 거치지 않으므로 백엔드로 직접 절대 URL 사용
const API_BASE =
  typeof window === 'undefined'
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'}/api/v1`
    : '/api/v1';

const AUTH_RETRY_SKIP_PREFIXES = ['/login/', '/groups/invite'];

const shouldSkipAuthRetry = (path: string, skipAuthRetry?: boolean) => {
  return Boolean(skipAuthRetry) || AUTH_RETRY_SKIP_PREFIXES.some((prefix) => path.startsWith(prefix));
};

const parseResponse = async <T>(res: Response): Promise<T> => {
  let json: unknown;
  try {
    const text = await res.text();
    json = text ? JSON.parse(text) : undefined;
  } catch {
    json = undefined;
  }

  if (!res.ok) {
    const data = json as ApiErrorData | undefined;
    throw new ApiError(res.status, data?.message ?? `Request failed (${res.status})`, data);
  }

  if (json === undefined) {
    return undefined as T;
  }
  if (json !== null && typeof json === 'object' && 'data' in json) {
    return (json as { data: T }).data;
  }
  return json as T;
};

const buildRequestInit = ({ body, headers, ...init }: Omit<ApiRequestOptions, 'skipAuthRetry'>): RequestInit => {
  const isFormData = body instanceof FormData;

  return {
    ...init,
    credentials: 'same-origin',
    headers: {
      ...(!isFormData && body !== undefined && { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  };
};

export const apiRequest = async <T>(path: string, options: ApiRequestOptions = {}): Promise<T> => {
  const { skipAuthRetry, ...requestOptions } = options;
  const init = buildRequestInit(requestOptions);
  const url = `${API_BASE}${path}`;

  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : '일시적으로 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.';
    throw new ApiError(503, message);
  }

  // 백엔드가 accessToken 쿠키 자체가 없는 미인증 요청에 401 대신 403을 내려주는 경우가 있어
  // (Spring Security 기본 AuthenticationEntryPoint) 401과 동일하게 재발급을 시도한다.
  // refreshToken도 없거나 진짜 권한 없음(403)이면 재발급이 실패해 원래 응답이 그대로 유지된다.
  if ((res.status === 401 || res.status === 403) && !shouldSkipAuthRetry(path, skipAuthRetry)) {
    try {
      await apiRequest('/login/reissue', { method: 'POST', skipAuthRetry: true });
      res = await fetch(url, init);
    } catch {
      // 재발급 실패 시 원래 401/403 응답을 그대로 처리한다.
    }
  }

  return parseResponse<T>(res);
};
