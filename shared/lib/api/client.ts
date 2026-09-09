import { ApiError, type ApiErrorData } from './error';

export type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  skipAuthRetry?: boolean;
};

const AUTH_RETRY_SKIP_PREFIXES = ['/login/', '/groups/invite'];

const getApiBase = () => {
  if (typeof window !== 'undefined') {
    return '/api/v1';
  }
  return `${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'}/api/v1`;
};

const shouldSkipAuthRetry = (path: string, skipAuthRetry?: boolean) => {
  return Boolean(skipAuthRetry) || AUTH_RETRY_SKIP_PREFIXES.some((prefix) => path.startsWith(prefix));
};

const parseResponse = async <T>(res: Response): Promise<T> => {
  if (res.type === 'opaqueredirect' || res.status === 0) {
    throw new ApiError(502, '로그인 상태를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.');
  }

  if (res.status >= 300 && res.status < 400) {
    throw new ApiError(res.status, 'API 프록시가 외부로 리다이렉트되었습니다. 잠시 후 다시 시도해 주세요.');
  }

  let json: unknown;
  try {
    const text = await res.text();
    json = text ? JSON.parse(text) : undefined;
  } catch {
    json = undefined;
  }

  if (!res.ok) {
    const data = json as ApiErrorData | undefined;
    const fallbackMessage =
      res.status === 403 ? '로그인 정보가 확인되지 않았어요. 다시 로그인해 주세요.' : `Request failed (${res.status})`;
    throw new ApiError(res.status, data?.message ?? fallbackMessage, data);
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
    credentials: 'include',
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
  const url = `${getApiBase()}${path}`;

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
      // 재발급 실패 시 원래 401 응답을 그대로 처리한다.
    }
  }

  return parseResponse<T>(res);
};
