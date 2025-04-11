import {FastifyInstance} from "fastify";
import {Friendship} from "@/types/friendships";
import {ObjectId} from "fastify-mongodb";
import {Filter} from "mongodb";

export async function getFriendshipsList(fastify: FastifyInstance, userId: string) {
    return await fastify.mongo.db!.collection('friendships').aggregate([
        {
            $match: {
                $or: [
                    { requester: new ObjectId(userId) },
                    { recipient: new ObjectId(userId) }
                ]
            }
        },
        {
            $addFields: {
                friendId: {
                    $cond: {
                        if: { $eq: ["$requester", new ObjectId(userId)] },
                        then: "$recipient",
                        else: "$requester"
                    }
                }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'friendId',
                foreignField: '_id',
                as: 'friend'
            }
        },
        {
            $unwind: "$friend"
        },
        {
            $project: {
                status: 1,
                type: 1,
                _id: 0,
                friendId: 1,
                friend: {
                    _id: "$friend._id",
                    full_name: "$friend.full_name",
                    email: "$friend.email",
                    avatar_url: "$friend.avatar_url"
                },
            }
        }
    ]).toArray();
}

export async function findOneFriendshipByQuery (fastify: FastifyInstance, filter: Filter<any>) {
    const friendship = await fastify.mongo.db!.collection('friendships').findOne(filter);
    if (!friendship) {
        throw new Error("Friendship request not found");
    }
    return friendship;
}

export async function findFriendshipRequest(fastify: FastifyInstance, userId: string, friendId: string): Promise<Friendship | null> {
    return await fastify.mongo.db!.collection('friendships').findOne(
        {
            $or: [
                { requester: new ObjectId(userId), recipient: new ObjectId(friendId) },
                { requester: new ObjectId(friendId), recipient: new ObjectId(userId) }
            ]
        }
    ) as Friendship;
}

export async function friendshipRequest(fastify: FastifyInstance, userId: string, friendId: string): Promise<Friendship> {
    const friendship: Friendship = {
        requester: new ObjectId(userId),
        recipient: new ObjectId(friendId),
        status: "pending",
        type: 'friend',
        created_at: new Date(),
    };
    const result = await fastify.mongo.db!.collection('friendships').insertOne(friendship);
    return { _id: result.insertedId, ...friendship };
}

export async function acceptFriendshipRequest(fastify: FastifyInstance, friendshipId: string) {
    const result = await fastify.mongo.db!.collection('friendships').updateOne(
        { _id: new ObjectId(friendshipId), status: 'pending' },
        { $set: { status: 'accepted' } }
    );
    if (result.modifiedCount === 0) {
        throw new Error("Friendship request not found or already accepted");
    }
}

export async function deleteFriendshipRequest(fastify: FastifyInstance, friendshipId: string) {
    const result = await fastify.mongo.db!.collection('friendships').deleteOne({ _id: new ObjectId(friendshipId) });
    if (result.deletedCount === 0) {
        throw new Error("Friendship request not found");
    }
}

export async function getFriendshipCollection(fastify: FastifyInstance) {
    return fastify.mongo.db!.collection("friendships");
}