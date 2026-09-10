import http, { type IncomingMessage, type OutgoingHttpHeaders } from 'node:http';
import https from 'node:https';

const FORWARD_REQUEST_HEADERS = new Set(['accept', 'authorization', 'content-type', 'cookie']);

const SKIP_RESPONSE_HEADERS = new Set([
  'connection',
  'content-encoding',
  'keep-alive',
  'location',
  'set-cookie',
  'transfer-encoding',
]);

export const getBackendApiBase = () => {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '');
};

export const readSetCookies = (response: Response) => {
  if (typeof response.headers.getSetCookie === 'function') {
    const cookies = response.headers.getSetCookie();
    if (cookies.length > 0) {
      return cookies;
    }
  }

  const combined = response.headers.get('set-cookie');
  return combined ? [combined] : [];
};

export const adaptSetCookieForBrowser = (setCookie: string, isHttps: boolean) => {
  const segments = setCookie
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean);

  if (segments.length === 0) {
    return setCookie;
  }

  const [nameValue, ...attributes] = segments;
  const nextAttributes: string[] = [];

  attributes.forEach((attribute) => {
    const separatorIndex = attribute.indexOf('=');
    const name = (separatorIndex === -1 ? attribute : attribute.slice(0, separatorIndex)).trim().toLowerCase();

    if (name === 'domain' || name === 'secure' || name === 'samesite' || name === 'partitioned' || name === 'path') {
      return;
    }
    nextAttributes.push(attribute);
  });

  nextAttributes.push('Path=/');
  nextAttributes.push('SameSite=Lax');
  if (isHttps) {
    nextAttributes.push('Secure');
  }

  return [nameValue, ...nextAttributes].join('; ');
};

const decodeCookieValue = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export const parseAuthCookies = (setCookies: string[]) => {
  return setCookies.flatMap((setCookie) => {
    const segments = setCookie
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean);
    const nameValue = segments[0];
    if (!nameValue) {
      return [];
    }
    const separatorIndex = nameValue.indexOf('=');
    if (separatorIndex <= 0) {
      return [];
    }
    const name = nameValue.slice(0, separatorIndex);
    const value = decodeCookieValue(nameValue.slice(separatorIndex + 1));
    let maxAge: number | undefined;
    segments.slice(1).forEach((attribute) => {
      const idx = attribute.indexOf('=');
      const attrName = (idx === -1 ? attribute : attribute.slice(0, idx)).trim().toLowerCase();
      if (attrName !== 'max-age' || idx === -1) {
        return;
      }
      const parsed = Number(attribute.slice(idx + 1));
      if (Number.isFinite(parsed)) {
        maxAge = parsed;
      }
    });
    return [{ name, value, maxAge }];
  });
};

export const copyBackendRequestHeaders = (request: Request) => {
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!FORWARD_REQUEST_HEADERS.has(key.toLowerCase())) {
      return;
    }
    headers.set(key, value);
  });
  return headers;
};

const toNodeHeaders = (headers: Headers): OutgoingHttpHeaders => {
  const result: OutgoingHttpHeaders = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
};

const toWebResponse = (res: IncomingMessage, body: Buffer) => {
  const headers = new Headers();
  for (const [key, value] of Object.entries(res.headers)) {
    if (value === undefined) {
      continue;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => {
        headers.append(key, item);
      });
      continue;
    }
    headers.set(key, value);
  }

  return new Response(new Uint8Array(body), {
    status: res.statusCode ?? 502,
    headers,
  });
};

/**
 * Next.js 패치 fetch는 외부 호스트로 Cookie를 빼는 경우가 있어,
 * 인증 프록시는 Node http(s)로 백엔드에 그대로 전달한다.
 */
export const fetchBackendDirect = ({
  url,
  method,
  headers,
  body,
}: {
  url: string;
  method: string;
  headers: Headers;
  body?: ArrayBuffer;
}): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const transport = parsed.protocol === 'https:' ? https : http;
    const nodeHeaders = toNodeHeaders(headers);
    if (body && body.byteLength > 0) {
      nodeHeaders['content-length'] = body.byteLength;
    }

    const req = transport.request(parsed, { method, headers: nodeHeaders }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer | string) => {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      });
      res.on('end', () => {
        resolve(toWebResponse(res, Buffer.concat(chunks)));
      });
    });

    req.on('error', reject);
    if (body && body.byteLength > 0) {
      req.write(Buffer.from(body));
    }
    req.end();
  });
};

export const copyBackendResponseHeaders = (response: Response, isHttps: boolean) => {
  const headers = new Headers();
  response.headers.forEach((value, key) => {
    if (SKIP_RESPONSE_HEADERS.has(key.toLowerCase())) {
      return;
    }
    headers.set(key, value);
  });
  readSetCookies(response).forEach((cookie) => {
    headers.append('Set-Cookie', adaptSetCookieForBrowser(cookie, isHttps));
  });
  return headers;
};
