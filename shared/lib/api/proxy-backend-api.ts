import { NextResponse } from 'next/server';

import {
  copyBackendRequestHeaders,
  copyBackendResponseHeaders,
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
  const targetUrl = `${backendBase}/api/v1/${path.join('/')}${requestUrl.search}`;

  if (new URL(backendBase).host === requestUrl.host) {
    return NextResponse.json({ message: 'API 프록시 대상이 잘못 설정되어 있습니다.' }, { status: 500 });
  }

  const headers = copyBackendRequestHeaders(request);
  const body = METHODS_WITHOUT_BODY.has(request.method) ? undefined : await request.arrayBuffer();

  let backendResponse: Response;
  try {
    backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      cache: 'no-store',
      redirect: 'manual',
    });
  } catch {
    return NextResponse.json(
      { message: '일시적으로 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.' },
      { status: 503 },
    );
  }

  const isHttps = requestUrl.protocol === 'https:';
  const responseHeaders = copyBackendResponseHeaders(backendResponse, isHttps);
  const hasBody = backendResponse.status !== 204 && backendResponse.status !== 304;

  return new NextResponse(hasBody ? backendResponse.body : null, {
    status: backendResponse.status,
    headers: responseHeaders,
  });
};
