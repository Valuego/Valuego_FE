const SKIP_REQUEST_HEADERS = new Set([
  'connection',
  'content-encoding',
  'content-length',
  'host',
  'keep-alive',
  'origin',
  'referer',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'accept-encoding',
]);

const SKIP_RESPONSE_HEADERS = new Set([
  'connection',
  'content-encoding',
  'keep-alive',
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
  let hasPath = false;

  attributes.forEach((attribute) => {
    const separatorIndex = attribute.indexOf('=');
    const name = (separatorIndex === -1 ? attribute : attribute.slice(0, separatorIndex)).trim().toLowerCase();

    if (name === 'domain' || name === 'secure' || name === 'samesite' || name === 'partitioned') {
      return;
    }
    if (name === 'path') {
      hasPath = true;
    }
    nextAttributes.push(attribute);
  });

  if (!hasPath) {
    nextAttributes.push('Path=/');
  }
  nextAttributes.push('SameSite=Lax');
  if (isHttps) {
    nextAttributes.push('Secure');
  }

  return [nameValue, ...nextAttributes].join('; ');
};

export const copyBackendRequestHeaders = (request: Request) => {
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (SKIP_REQUEST_HEADERS.has(key.toLowerCase())) {
      return;
    }
    headers.set(key, value);
  });
  return headers;
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
