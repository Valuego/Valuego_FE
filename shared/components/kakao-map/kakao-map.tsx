'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/shared/lib/cn';

export type KakaoMapPlace = {
  id: number | string;
  lat: number;
  lng: number;
};

type KakaoMapProps = {
  places: KakaoMapPlace[];
  badge?: string;
  className?: string;
};

const SDK_SRC_PREFIX = '//dapi.kakao.com/v2/maps/sdk.js';

let kakaoSdkPromise: Promise<void> | null = null;

const loadKakaoMapsSdk = (appKey: string): Promise<void> => {
  if (window.kakao?.maps) {
    return Promise.resolve();
  }

  if (kakaoSdkPromise) {
    return kakaoSdkPromise;
  }

  kakaoSdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `${SDK_SRC_PREFIX}?appkey=${appKey}&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao?.maps.load(() => resolve());
    };
    script.onerror = () => {
      kakaoSdkPromise = null;
      reject(new Error('카카오맵 SDK를 불러오지 못했어요.'));
    };
    document.head.appendChild(script);
  });

  return kakaoSdkPromise;
};

export const KakaoMap = ({ places, badge, className }: KakaoMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const overlaysRef = useRef<{ markers: kakao.maps.Marker[]; polyline: kakao.maps.Polyline | null }>({
    markers: [],
    polyline: null,
  });
  const [status, setStatus] = useState<'idle' | 'ready' | 'error'>('idle');
  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY?.trim();

  useEffect(() => {
    if (!appKey || !containerRef.current || places.length === 0) {
      return;
    }

    let cancelled = false;

    void loadKakaoMapsSdk(appKey)
      .then(() => {
        if (cancelled || !containerRef.current || !window.kakao?.maps) {
          return;
        }

        const { maps } = window.kakao;
        const path = places.map((place) => new maps.LatLng(place.lat, place.lng));

        if (!mapRef.current) {
          mapRef.current = new maps.Map(containerRef.current, { center: path[0], level: 6 });
        }
        const map = mapRef.current;

        overlaysRef.current.markers.forEach((marker) => marker.setMap(null));
        overlaysRef.current.polyline?.setMap(null);

        const bounds = new maps.LatLngBounds();
        path.forEach((position) => bounds.extend(position));
        map.setBounds(bounds);

        const markers = path.map((position) => new maps.Marker({ position, map }));
        const polyline = new maps.Polyline({
          path,
          strokeWeight: 4,
          strokeColor: '#3366ff',
          strokeOpacity: 0.85,
          strokeStyle: 'solid',
        });
        polyline.setMap(map);
        overlaysRef.current = { markers, polyline };

        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) {
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appKey, JSON.stringify(places)]);

  useEffect(() => {
    return () => {
      overlaysRef.current.markers.forEach((marker) => marker.setMap(null));
      overlaysRef.current.polyline?.setMap(null);
      mapRef.current = null;
    };
  }, []);

  if (!appKey) {
    return (
      <div
        className={cn(
          'border-line-hairline flex h-[180px] w-full items-center justify-center rounded-2xl border bg-[#eef1f5] text-center text-[12.5px] font-medium text-[rgba(55,56,60,0.5)]',
          className,
        )}
      >
        지도를 표시하려면 카카오맵 설정이 필요해요
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div
        className={cn(
          'border-line-hairline flex h-[180px] w-full items-center justify-center rounded-2xl border bg-[#eef1f5] text-center text-[12.5px] font-medium text-[rgba(55,56,60,0.5)]',
          className,
        )}
      >
        지도를 불러오지 못했어요
      </div>
    );
  }

  return (
    <div className={cn('relative h-[180px] w-full overflow-hidden rounded-2xl', className)}>
      <div ref={containerRef} className="size-full" />
      {badge ? (
        <span className="border-line-hairline absolute top-2.5 left-2.5 rounded-full border bg-white/95 px-3 py-1.5 text-[11.5px] font-bold text-[rgba(46,47,51,0.88)] shadow-[0px_2px_6px_rgba(23,23,25,0.12)]">
          {badge}
        </span>
      ) : null}
    </div>
  );
};
