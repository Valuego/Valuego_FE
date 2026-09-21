import type { MemberKey } from '@/shared/session';

import type { ExpenseCategory, MemberColor, TravelSchedule } from './trip.types';

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
    pillClassName: 'bg-[rgba(112,115,132,0.08)] text-[rgba(55,56,60,0.61)]',
    thumbClassName: 'bg-[#eaf6ec]',
  },
  관광: {
    label: '관광',
    emoji: '🏘️',
    pillClassName: 'bg-[rgba(51,102,255,0.08)] text-[#3366ff]',
    thumbClassName: 'bg-[#edf0fa]',
  },
  식사: {
    label: '식사',
    emoji: '🍜',
    pillClassName: 'bg-[rgba(255,146,0,0.1)] text-[#e08300]',
    thumbClassName: 'bg-[#fff3db]',
  },
};

export const PLACE_TYPE_ALIASES: Record<string, keyof typeof PLACE_TYPE_STYLE> = {
  이동: '이동',
  관광: '관광',
  식사: '식사',
  맛집: '식사',
  음식: '식사',
  식당: '식사',
  카페: '식사',
  명소: '관광',
  숙소: '관광',
  호텔: '관광',
  교통: '이동',
  TOUR: '관광',
  TOURISM: '관광',
  TOURIST: '관광',
  TOURISTSPOT: '관광',
  TOURIST_SPOT: '관광',
  ATTRACTION: '관광',
  SIGHTSEEING: '관광',
  SIGHT: '관광',
  ACTIVITY: '관광',
  CUSTOM: '관광',
  HOTEL: '관광',
  STAY: '관광',
  ACCOMMODATION: '관광',
  LODGE: '관광',
  RESTAURANT: '식사',
  FOOD: '식사',
  MEAL: '식사',
  CAFE: '식사',
  EATERY: '식사',
  DINING: '식사',
  TRANSPORT: '이동',
  TRANSFER: '이동',
  MOVE: '이동',
  TRAFFIC: '이동',
  TRANSIT: '이동',
  DRIVE: '이동',
  '12': '관광',
  '14': '관광',
  '15': '관광',
  '25': '관광',
  '28': '관광',
  '32': '관광',
  '38': '관광',
  '39': '식사',
};

export const DEFAULT_PLACE_TYPE_STYLE = {
  label: '관광',
  emoji: '📍',
  pillClassName: 'bg-[rgba(51,102,255,0.08)] text-[#3366ff]',
  thumbClassName: 'bg-[#edf0fa]',
};

export const EXPENSE_CATEGORY_OPTIONS: { category: ExpenseCategory; label: string; emoji: string }[] = [
  { category: 'MEAL', label: '식사', emoji: '🍽️' },
  { category: 'GAS', label: '이동', emoji: '🚕' },
  { category: 'ACCOMMODATION', label: '숙소', emoji: '🏨' },
  { category: 'CAFE', label: '카페', emoji: '☕' },
  { category: 'OTHER', label: '기타', emoji: '💳' },
];

export const expenseCategoryLabel = (category: ExpenseCategory | null) =>
  EXPENSE_CATEGORY_OPTIONS.find((item) => item.category === category)?.label ?? '기타';

export const expenseCategoryEmoji = (category: ExpenseCategory | null) =>
  EXPENSE_CATEGORY_OPTIONS.find((item) => item.category === category)?.emoji ?? '💳';

export const INVITE_HIGHLIGHTS = [
  { id: 'map', label: '지도로 한눈에 보는 동선' },
  { id: 'vote', label: '가고 싶은 곳 투표' },
  { id: 'settle', label: '정산은 가치가자에게 맡기기' },
] as const;

export const LOCAL_DEMO_SCHEDULE: TravelSchedule = {
  travelId: 0,
  days: [
    {
      travelDayId: 0,
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
          latitude: 35.1586,
          longitude: 129.1603,
        },
        {
          travelPlaceId: 9002,
          visitTime: '12:30:00',
          name: '광안리 밀면',
          address: '부산 수영구',
          placeType: '식사',
          reason: '이동이 짧고 다 같이 먹기 좋은 점심',
          latitude: 35.1532,
          longitude: 129.1186,
        },
        {
          travelPlaceId: 9003,
          visitTime: '16:00:00',
          name: '감천문화마을',
          address: '부산 사하구',
          placeType: '관광',
          reason: '사진 찍기 좋은 골목 산책',
          latitude: 35.0975,
          longitude: 129.0106,
        },
      ],
    },
  ],
};
