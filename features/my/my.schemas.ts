import { z } from 'zod';

export const notificationSchema = z.object({
  notificationId: z.coerce.number(),
  userId: z.coerce.number().nullable().optional(),
  guestGroupMemberId: z.coerce.number().nullable().optional(),
  type: z.enum(['RETROSPECT_COMPLETE', 'GROUP_JOIN_COMPLETE']).nullable().optional(),
  title: z.string().optional().default(''),
  content: z.string().nullable().optional(),
  targetId: z.coerce.number().nullable().optional(),
  isRead: z.boolean().optional().default(false),
  notificationCreatedAt: z.string().nullable().optional(),
  totalCount: z.coerce.number().nullable().optional(),
});

export const notificationListSchema = z.array(notificationSchema);
