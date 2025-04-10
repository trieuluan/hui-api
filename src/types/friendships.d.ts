import {ObjectId} from "fastify-mongodb";

export type FriendshipStatus = 'pending' | 'accepted' | 'rejected';
export type FriendshipType = 'friend' | 'block';
export interface Friendship {
    _id?: ObjectId;
    requester: ObjectId;
    recipient: ObjectId;
    status: FriendshipStatus;
    type: FriendshipType;
    created_at?: Date;
    updated_at?: Date;
}