import type { ReactNode } from 'react';

import Script from 'next/script';

type TripLayoutProps = {
  children: ReactNode;
};

const kakaoMapKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY?.trim();

const TripLayout = ({ children }: TripLayoutProps) => {
  return (
    <>
      {kakaoMapKey ? (
        <Script
          id="kakao-maps-sdk"
          src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapKey}&autoload=false&libraries=services`}
          strategy="afterInteractive"
        />
      ) : null}
      {children}
    </>
  );
};

export default TripLayout;
