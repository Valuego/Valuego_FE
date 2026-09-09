import { z } from 'zod';

const memberColorSchema = z.enum(['BLUE', 'PURPLE', 'SKYBLUE', 'ORANGE']);

export const loginInfoSchema = z.object({
  userId: z.coerce.number(),
});

export const userNotificationAgreeSchema = z.object({
  notifyComments: z.boolean(),
  notifyReminders: z.boolean(),
  notifySettlement: z.boolean(),
  notifyMarketing: z.boolean(),
});

export const userProfileSchema = z.object({
  userId: z.coerce.number(),
  nickname: z.string(),
  email: z.string(),
  profileImageUrl: z.string().nullable().optional(),
  socialType: z.string(),
  userRole: z.string(),
  memberColor: memberColorSchema,
  notificationAgree: userNotificationAgreeSchema.nullable().optional(),
});
