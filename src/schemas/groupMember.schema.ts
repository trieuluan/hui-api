import { z } from 'zod';
import { ObjectId } from 'mongodb';

export const groupMemberSchema = z.object({
    _id: z.instanceof(ObjectId).optional(),
    groupId: z.instanceof(ObjectId),
    userId: z.instanceof(ObjectId),
    slots: z.number().int().min(1),
    joinedAt: z.date().default(() => new Date()),
    status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
});

export const groupMemberListSchema = z.object({
    members: z.array(groupMemberSchema),
    total: z.number(),
}).strict();

export const groupMemberApproveParamsSchema = z.object({
    id: z.string().refine((val) => ObjectId.isValid(val), {
        message: 'Invalid group member ID',
    }),
}).strict();

export type GroupMember = z.infer<typeof groupMemberSchema>;
export type GroupMemberList = z.infer<typeof groupMemberListSchema>;
export type GroupMemberApproveParams = z.infer<typeof groupMemberApproveParamsSchema>;