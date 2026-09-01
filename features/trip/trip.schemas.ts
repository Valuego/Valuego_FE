import { z } from 'zod';

const destinationSchema = z.enum(['BUSAN', 'GANGNEUNG', 'GYEONGJU', 'YEOSU', 'JEONJU', 'SOKCHO']);
const transportTypeSchema = z.enum(['RENT', 'PUBLIC']);
const groupStatusSchema = z.enum(['PLANNING', 'CONFIRMED', 'COMPLETED']);
const memberColorSchema = z.enum(['BLUE', 'PURPLE', 'SKYBLUE', 'ORANGE']);
const memberRoleSchema = z.enum(['LEADER', 'MEMBER']);
const memberStatusSchema = z.enum(['PENDING', 'BEFORE_PREFERENCE', 'COMPLETED']);
const budgetTypeSchema = z.enum(['ECONOMICAL', 'MODERATE', 'LUXURY']);
const foodTypeSchema = z.enum(['KOREAN', 'JAPANESE', 'CHINESE']);

export const groupMemberInfoSchema = z.object({
  groupMemberId: z.number(),
  memberName: z.string(),
  memberColor: memberColorSchema,
  memberRole: memberRoleSchema,
  memberStatus: memberStatusSchema,
});

export const groupInfoSchema = z.object({
  groupId: z.number(),
  title: z.string(),
  destination: destinationSchema,
  startDate: z.string(),
  endDate: z.string(),
  currentMemberCount: z.number(),
  memberCount: z.number(),
  transportType: transportTypeSchema,
  groupLink: z.string(),
  dDay: z.string(),
  members: z.array(groupMemberInfoSchema),
  groupStatus: groupStatusSchema,
});

export const groupListSchema = z.object({
  ongoingGroups: z.array(groupInfoSchema),
  pastGroups: z.array(groupInfoSchema),
});

export const styleInfoSchema = z.object({
  styleId: z.number(),
  groupId: z.number(),
  groupMemberId: z.number(),
  budgetType: budgetTypeSchema,
  foodType: foodTypeSchema,
  activityIntensity: z.number(),
});

export const schedulePlaceSchema = z.object({
  travelPlaceId: z.number(),
  contentId: z.string().nullable().optional(),
  visitTime: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  scheduleOrder: z.number().nullable().optional(),
  placeType: z.string().nullable().optional(),
  reason: z.string().nullable().optional(),
  distanceFromPreviousKm: z.number().nullable().optional(),
  memoUrl: z.string().nullable().optional(),
});

export const scheduleDaySchema = z.object({
  dayNumber: z.number(),
  totalDistanceKm: z.number().nullable().optional(),
  places: z.array(schedulePlaceSchema),
});

export const travelScheduleSchema = z.object({
  travelId: z.number(),
  days: z.array(scheduleDaySchema),
});
