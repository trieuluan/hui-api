import { z } from 'zod';

// 1. Tạo schema con cho friend
const friendSchema = z.object({
    _id: z.string(),
    full_name: z.string(),
    email: z.string().email(),
    avatar_url: z.string().url().optional(),
})

// 2. Tạo schema cho friendship response
export const friendshipResponseSchema = z.object({
    _id: z.string(),
    requester: z.string(),
    recipient: z.string(),
    status: z.enum(['pending', 'accepted', 'rejected']),
    type: z.enum(['friend', 'block']),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    friendId: z.string(),
    friend: friendSchema,
}).strict();

// 3. Tạo schema cho ListFriendshipResponse
export const ListFriendshipResponseSchema = z.object({
    friendships: z.array(friendshipResponseSchema),
}).strict();

// 4. Tạo schema cho friendshipRequestBody
export const friendshipRequestBodySchema = z.object({
    friendId: z.string(),
}).strict();

// 5. Tạo schema cho friendshipACDBody
export const friendshipACDBodySchema = z.object({
    friendshipId: z.string(),
}).strict();

export type FriendshipResponse = z.infer<typeof friendshipResponseSchema>;
export type ListFriendshipResponse = z.infer<typeof ListFriendshipResponseSchema>;
export type FriendshipRequestBody = z.infer<typeof friendshipRequestBodySchema>;
export type FriendshipACDBody = z.infer<typeof friendshipACDBodySchema>;