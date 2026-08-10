'use client';

import NextError from 'next/error';

const GlobalError = () => {
  return (
    <html lang="ko">
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
};

// eslint-disable-next-line import/no-default-export
export default GlobalError;
