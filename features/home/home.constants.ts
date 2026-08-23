import type { avatarVariants } from '@/shared/components/avatar';

import type { VariantProps } from 'class-variance-authority';

export type MemberKey = NonNullable<VariantProps<typeof avatarVariants>['member']>;

export type TripSummary = {
  id: string;
  title: string;
  dateLabel: string;
  status: 'ongoing' | 'settled';
  dDayLabel?: string;
  members: MemberKey[];
  totalAmount?: string;
  perPersonAmount?: string;
};

export const CURRENT_USER = {
  name: '김도연',
  greetingName: '도연',
  email: 'doyeon@naver.com',
  member: 'doyeon' as const,
};

export const ACTIVE_TRIP: TripSummary = {
  id: 'busan-2026',
  title: '부산 우정여행',
  dateLabel: '2026.06.20 – 06.22',
  status: 'ongoing',
  dDayLabel: '진행 중 · D-1',
  members: ['doyeon', 'seojun', 'hayeong', 'minjae'],
  totalAmount: '330,000원',
  perPersonAmount: '82,500원',
};

export const PAST_TRIPS: TripSummary[] = [
  {
    id: 'gangneung-2026',
    title: '강릉 우정여행',
    dateLabel: '2026.05.02 – 05.04',
    status: 'settled',
    members: ['doyeon', 'seojun', 'hayeong', 'minjae'],
    totalAmount: '248,000원',
    perPersonAmount: '62,000원',
  },
  {
    id: 'jeju-2026',
    title: '제주 한 달 살기',
    dateLabel: '2026.03.10 – 03.13',
    status: 'settled',
    members: ['doyeon', 'seojun', 'hayeong'],
    totalAmount: '512,000원',
    perPersonAmount: '170,600원',
  },
];

export const DESTINATIONS = ['부산', '강릉', '경주', '여수', '전주', '속초'] as const;
export const BUDGET_OPTIONS = ['알뜰하게', '적당히', '플렉스'] as const;
export const FOOD_OPTIONS = ['한식', '일식', '중식'] as const;
