import { NextResponse } from 'next/server';

import {
  copyBackendRequestHeaders,
  copyBackendResponseHeaders,
  fetchBackendDirect,
  getBackendApiBase,
} from '@/shared/lib/api/backend-proxy';

const METHODS_WITHOUT_BODY = new Set(['GET', 'HEAD']);

type ProxyContext = {
  params: Promise<{ path: string[] }>;
};

export const proxyBackendApi = async (request: Request, context: ProxyContext) => {
  const { path } = await context.params;
  const backendBase = getBackendApiBase();
  const requestUrl = new URL(request.url);
  const backendHost = new URL(backendBase).host;
  const targetUrl = `${backendBase}/api/v1/${path.join('/')}${requestUrl.search}`;

  if (backendHost === requestUrl.host) {
    return NextResponse.json({ message: 'API 프록시 대상이 잘못 설정되어 있습니다.' }, { status: 500 });
  }

  const headers = copyBackendRequestHeaders(request);
  const body = METHODS_WITHOUT_BODY.has(request.method) ? undefined : await request.arrayBuffer();

  let backendResponse: Response;
  try {
    backendResponse = await fetchBackendFollowingRedirects({
      url: targetUrl,
      backendHost,
      method: request.method,
      headers,
      body,
    });
  } catch {
    return NextResponse.json(
      { message: '일시적으로 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.' },
      { status: 503 },
    );
  }

  if (backendResponse.status >= 300 && backendResponse.status < 400) {
    return NextResponse.json({ message: '백엔드가 예상치 못한 리다이렉트를 반환했습니다.' }, { status: 502 });
  }

  const isHttps = requestUrl.protocol === 'https:';
  const responseHeaders = copyBackendResponseHeaders(backendResponse, isHttps);
  const hasBody = backendResponse.status !== 204 && backendResponse.status !== 304;

  return new NextResponse(hasBody ? backendResponse.body : null, {
    status: backendResponse.status,
    headers: responseHeaders,
  });
};

const fetchBackendFollowingRedirects = async ({
  url,
  backendHost,
  method,
  headers,
  body,
}: {
  url: string;
  backendHost: string;
  method: string;
  headers: Headers;
  body?: ArrayBuffer;
}) => {
  let currentUrl = url;
  let response: Response | null = null;

  for (let hop = 0; hop < 5; hop += 1) {
    response = await fetchBackendDirect({
      url: currentUrl,
      method,
      headers,
      body,
    });

    if (response.status < 300 || response.status >= 400) {
      return response;
    }

    const location = response.headers.get('location');
    if (!location) {
      return response;
    }

    const nextUrl = new URL(location, currentUrl);
    if (nextUrl.host.replace(/^www\./, '') !== backendHost.replace(/^www\./, '')) {
      return response;
    }

    const shouldSwitchToGet = response.status === 301 || response.status === 302;
    if (shouldSwitchToGet && method !== 'GET' && method !== 'HEAD') {
      return fetchBackendFollowingRedirects({
        url: nextUrl.toString(),
        backendHost,
        method: 'GET',
        headers,
      });
    }

    currentUrl = nextUrl.toString();
  }

  return response as Response;
};
