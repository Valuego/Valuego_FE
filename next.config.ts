import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/trips/join',
        destination: '/join',
        permanent: false,
      },
      {
        source: '/j/:code',
        destination: '/invite/:code',
        permanent: false,
      },
      {
        source: '/gachigachi.app/j/:code',
        destination: '/invite/:code',
        permanent: false,
      },
      {
        source: '/invite',
        destination: '/join',
        permanent: false,
      },
    ];
  },
  // /api/v1 은 app/api/v1/[...path] 라우트 핸들러가 쿠키를 붙여 백엔드로 프록시한다.
  turbopack: {
    // Project root must be this app directory; `..` breaks `@/` and `shared/...` resolution on Linux CI.
    root: __dirname,
    rules: {
      '*.svg': {
        loaders: [
          {
            loader: '@svgr/webpack',
            options: {
              icon: true,
            },
          },
        ],
        as: '*.js',
      },
    },
  },
};

// eslint-disable-next-line import/no-default-export
export default nextConfig;
