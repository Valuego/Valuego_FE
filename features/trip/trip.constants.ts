import type { MemberKey } from '@/shared/session';

import type { MemberColor, TravelSchedule } from './trip.types';

export const GUEST_COLOR_OPTIONS: {
  color: MemberColor;
  member: MemberKey;
  className: string;
}[] = [
  { color: 'BLUE', member: 'doyeon', className: 'bg-member-doyeon' },
  { color: 'PURPLE', member: 'seojun', className: 'bg-member-seojun' },
  { color: 'SKYBLUE', member: 'hayeong', className: 'bg-member-hayeong' },
  { color: 'ORANGE', member: 'minjae', className: 'bg-member-minjae' },
];

export const PLACE_TYPE_STYLE: Record<
  string,
  { label: string; emoji: string; pillClassName: string; thumbClassName: string }
> = {
  이동: {
    label: '이동',
    emoji: '🚄',
    pillClassName: 'bg-[rgba(112,115,132,0.08)] text-text-secondary-soft',
    thumbClassName: 'bg-[#eaf6ec]',
  },
  관광: {
    label: '관광',
    emoji: '🏘️',
    pillClassName: 'bg-brand-blue/8 text-brand-blue',
    thumbClassName: 'bg-[#edf0fa]',
  },
  식사: {
    label: '식사',
    emoji: '🍜',
    pillClassName: 'bg-[rgba(255,146,0,0.1)] text-[#e08300]',
    thumbClassName: 'bg-[#fff3db]',
  },
};

export const DEFAULT_PLACE_TYPE_STYLE = {
  label: '장소',
  emoji: '📍',
  pillClassName: 'bg-brand-blue/8 text-brand-blue',
  thumbClassName: 'bg-[#edf0fa]',
};

export const INVITE_HIGHLIGHTS = [
  { id: 'ai', label: 'AI가 짜는 우리 그룹 맞춤 일정' },
  { id: 'game', label: '애매한 결정은 게임으로' },
  { id: 'settle', label: '보이지 않는 수고까지 정산' },
] as const;

export const LOCAL_DEMO_SCHEDULE: TravelSchedule = {
  travelId: 0,
  days: [
    {
      dayNumber: 1,
      totalDistanceKm: 32.2,
      places: [
        {
          travelPlaceId: 9001,
          visitTime: '10:00:00',
          name: '해운대 해수욕장',
          address: '부산 해운대구',
          placeType: '관광',
          reason: '첫날 바다를 보고 숨을 고르는 코스',
        },
        {
          travelPlaceId: 9002,
          visitTime: '12:30:00',
          name: '광안리 밀면',
          address: '부산 수영구',
          placeType: '식사',
          reason: '이동이 짧고 다 같이 먹기 좋은 점심',
        },
        {
          travelPlaceId: 9003,
          visitTime: '16:00:00',
          name: '감천문화마을',
          address: '부산 사하구',
          placeType: '관광',
          reason: '사진 찍기 좋은 골목 산책',
        },
      ],
    },
  ],
};
