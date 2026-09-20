'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/shared/lib/cn';

export type KakaoMapPlace = {
  id: number | string;
  lat?: number | null;
  lng?: number | null;
  name?: string | null;
  address?: string | null;
};

type KakaoMapProps = {
  places: KakaoMapPlace[];
  badge?: string;
  className?: string;
  fallbackCenter?: { lat: number; lng: number };
};

type ResolvedPlace = {
  id: number | string;
  lat: number;
  lng: number;
};

const SDK_SCRIPT_ID = 'kakao-maps-sdk';
const DEFAULT_CENTER = { lat: 35.1796, lng: 129.0756 };
const geocodeCache = new Map<string, { lat: number; lng: number }>();

let kakaoSdkPromise: Promise<void> | null = null;

const isValidCoord = (lat?: number | null, lng?: number | null): boolean => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    !(lat === 0 && lng === 0)
  );
};

const isKakaoMapsReady = () => {
  return Boolean(window.kakao?.maps?.LatLng && window.kakao?.maps?.Map);
};

const getSdkSrc = (appKey: string) => {
  return `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;
};

const waitForMapsApi = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isKakaoMapsReady()) {
      resolve();
      return;
    }
    const maps = window.kakao?.maps;
    if (!maps) {
      reject(new Error('카카오맵 SDK를 불러오지 못했어요.'));
      return;
    }
    maps.load(() => {
      if (isKakaoMapsReady()) {
        resolve();
        return;
      }
      reject(new Error('카카오맵 SDK를 불러오지 못했어요.'));
    });
  });
};

const loadKakaoMapsSdk = (appKey: string): Promise<void> => {
  if (isKakaoMapsReady()) {
    return Promise.resolve();
  }

  if (kakaoSdkPromise) {
    return kakaoSdkPromise;
  }

  kakaoSdkPromise = new Promise((resolve, reject) => {
    const fail = () => {
      kakaoSdkPromise = null;
      reject(new Error('카카오맵 SDK를 불러오지 못했어요.'));
    };

    const start = () => {
      void waitForMapsApi().then(resolve).catch(fail);
    };

    const existing =
      (document.getElementById(SDK_SCRIPT_ID) as HTMLScriptElement | null) ??
      document.querySelector<HTMLScriptElement>('script[src*="dapi.kakao.com/v2/maps/sdk.js"]');
    if (existing) {
      if (window.kakao?.maps) {
        start();
        return;
      }
      existing.addEventListener('load', start, { once: true });
      existing.addEventListener('error', fail, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = SDK_SCRIPT_ID;
    script.src = getSdkSrc(appKey);
    script.async = true;
    script.onload = start;
    script.onerror = fail;
    document.head.appendChild(script);
  });

  return kakaoSdkPromise;
};

const toCoord = (x: string, y: string) => {
  const lat = Number(y);
  const lng = Number(x);
  return isValidCoord(lat, lng) ? { lat, lng } : null;
};

const searchByAddress = (query: string): Promise<{ lat: number; lng: number } | null> => {
  return new Promise((resolve) => {
    if (!window.kakao?.maps?.services?.Geocoder) {
      resolve(null);
      return;
    }
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(query, (result, status) => {
      if (status === window.kakao?.maps.services.Status.OK && result[0]) {
        resolve(toCoord(result[0].x, result[0].y));
        return;
      }
      resolve(null);
    });
  });
};

const searchByKeyword = (query: string): Promise<{ lat: number; lng: number } | null> => {
  return new Promise((resolve) => {
    if (!window.kakao?.maps?.services?.Places) {
      resolve(null);
      return;
    }
    const places = new window.kakao.maps.services.Places();
    places.keywordSearch(query, (result, status) => {
      if (status === window.kakao?.maps.services.Status.OK && result[0]) {
        resolve(toCoord(result[0].x, result[0].y));
        return;
      }
      resolve(null);
    });
  });
};

const resolvePlaceCoord = async (place: KakaoMapPlace): Promise<ResolvedPlace | null> => {
  if (isValidCoord(place.lat, place.lng)) {
    return { id: place.id, lat: place.lat as number, lng: place.lng as number };
  }

  const queries = [place.address, place.name, [place.name, place.address].filter(Boolean).join(' ')].filter(
    (query): query is string => Boolean(query && query.trim()),
  );

  for (const query of queries) {
    const cached = geocodeCache.get(query);
    if (cached) {
      return { id: place.id, ...cached };
    }

    const found = (await searchByAddress(query)) ?? (await searchByKeyword(query));
    if (found) {
      geocodeCache.set(query, found);
      return { id: place.id, ...found };
    }
  }

  return null;
};

const markerContent = (order: number) => {
  return `<div style="display:flex;align-items:center;justify-content:center;width:22px;height:22px;border:2px solid #fff;border-radius:999px;background:#3366ff;color:#fff;font-size:11px;font-weight:700;box-shadow:0 2px 6px rgba(23,23,25,0.24);">${order}</div>`;
};

export const KakaoMap = ({ places, badge, className, fallbackCenter = DEFAULT_CENTER }: KakaoMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const overlaysRef = useRef<{
    markers: kakao.maps.CustomOverlay[];
    polyline: kakao.maps.Polyline | null;
  }>({
    markers: [],
    polyline: null,
  });
  const [status, setStatus] = useState<'idle' | 'ready' | 'error'>('idle');
  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY?.trim();
  const placesKey = places
    .map((place) => `${place.id}:${place.lat ?? ''}:${place.lng ?? ''}:${place.name ?? ''}:${place.address ?? ''}`)
    .join('|');

  useEffect(() => {
    if (!appKey || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    const currentPlaces = places;
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;

    const clearOverlays = () => {
      overlaysRef.current.markers.forEach((marker) => marker.setMap(null));
      overlaysRef.current.polyline?.setMap(null);
      overlaysRef.current = { markers: [], polyline: null };
    };

    const drawMap = (resolved: ResolvedPlace[]) => {
      if (cancelled || !container || !window.kakao?.maps) {
        return;
      }

      const { maps } = window.kakao;
      const center = resolved[0]
        ? new maps.LatLng(resolved[0].lat, resolved[0].lng)
        : new maps.LatLng(fallbackCenter.lat, fallbackCenter.lng);

      container.replaceChildren();
      mapRef.current = new maps.Map(container, {
        center,
        level: resolved.length > 1 ? 7 : 5,
        scrollwheel: false,
      });
      const map = mapRef.current;
      map.addControl(new maps.ZoomControl(), maps.ControlPosition.RIGHT);
      map.relayout();

      if (resolved.length === 0) {
        map.setCenter(center);
        setStatus('ready');
        return;
      }

      const path = resolved.map((place) => new maps.LatLng(place.lat, place.lng));
      const bounds = new maps.LatLngBounds();
      path.forEach((position) => bounds.extend(position));
      map.setBounds(bounds);

      const markers = path.map((position, index) => {
        const overlay = new maps.CustomOverlay({
          map,
          position,
          content: markerContent(index + 1),
          yAnchor: 1,
          zIndex: index + 1,
        });
        return overlay;
      });

      const polyline =
        path.length > 1
          ? new maps.Polyline({
              path,
              strokeWeight: 4,
              strokeColor: '#3366ff',
              strokeOpacity: 0.9,
              strokeStyle: 'solid',
            })
          : null;
      polyline?.setMap(map);
      overlaysRef.current = { markers, polyline };

      requestAnimationFrame(() => {
        if (cancelled) {
          return;
        }
        map.relayout();
        if (resolved.length > 1) {
          map.setBounds(bounds);
        } else {
          map.setCenter(path[0] ?? center);
        }
      });

      setStatus('ready');
    };

    void loadKakaoMapsSdk(appKey)
      .then(async () => {
        if (cancelled) {
          return;
        }
        const resolved = (await Promise.all(currentPlaces.map(resolvePlaceCoord))).filter(
          (place): place is ResolvedPlace => place !== null,
        );
        if (cancelled) {
          return;
        }
        clearOverlays();
        drawMap(resolved);

        if (container && typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver(() => {
            mapRef.current?.relayout();
          });
          resizeObserver.observe(container);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      clearOverlays();
      mapRef.current = null;
    };
    // placesKey is a stable serialization of `places`
    // eslint-disable-next-line react-hooks/exhaustive-deps -- redraw only when place data actually changes
  }, [appKey, fallbackCenter.lat, fallbackCenter.lng, placesKey]);

  if (!appKey) {
    return (
      <div
        className={cn(
          'border-line-hairline flex h-[140px] w-full items-center justify-center rounded-2xl border bg-[#eef1f5] px-4 text-center text-[12.5px] font-medium text-[rgba(55,56,60,0.5)]',
          className,
        )}
      >
        지도를 표시하려면 NEXT_PUBLIC_KAKAO_MAP_KEY 설정이 필요해요
      </div>
    );
  }

  return (
    <div className={cn('relative isolate z-0 h-[140px] w-full overflow-hidden rounded-2xl bg-[#eef1f5]', className)}>
      <div ref={containerRef} className="h-[140px] w-full" />
      {status !== 'ready' ? (
        <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center px-4 text-center text-[12.5px] font-medium text-[rgba(55,56,60,0.5)]">
          {status === 'error'
            ? '지도를 불러오지 못했어요. 카카오 콘솔 웹 도메인 등록을 확인해 주세요.'
            : '지도를 불러오는 중…'}
        </div>
      ) : null}
      {badge ? (
        <span className="pointer-events-none absolute top-3 left-3 z-10 rounded-md bg-white px-2 py-1 text-[10.5px] font-bold text-[#171717] shadow-[0px_1px_4px_rgba(23,23,25,0.08)]">
          {badge}
        </span>
      ) : null}
    </div>
  );
};
