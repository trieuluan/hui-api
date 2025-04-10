import {FastifyInstance} from "fastify";
import {Friendship} from "@/types/friendships";
import {ObjectId} from "fastify-mongodb";

export async function getFriendshipsList(fastify: FastifyInstance, userId: string) {
    return await fastify.mongo.db!.collection('friendships').aggregate([
        {
            $match: { requester: new ObjectId(userId) }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'recipient',
                foreignField: '_id',
                as: 'recipient_info'
            }
        },
        {
            $unwind: "$recipient_info"
        },
        {
            $project: {
                status: 1,
                type: 1,
                _id: 0,
                "recipient_info._id": 1,
                "recipient_info.email": 1,
                "recipient_info.full_name": 1,
            }
        }
    ]).toArray();
}

export async function findFriendshipRequest(fastify: FastifyInstance, userId: string, friendId: string): Promise<Friendship | null> {
    return await fastify.mongo.db!.collection('friendships').findOne(
        {requester: new ObjectId(userId), recipient: new ObjectId(friendId)}
    ) as Friendship;
}

export async function friendshipExists(fastify: FastifyInstance, userId: string, friendId: string): Promise<boolean> {
    const friendship = await fastify.mongo.db!.collection('friendships').findOne({
        requester: new ObjectId(userId), recipient: new ObjectId(friendId)
    });
    return !!friendship;
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

export async function cancelFriendshipRequest(fastify: FastifyInstance, userId: string, friendId: string) {
    const result = await fastify.mongo.db!.collection('friendships').deleteOne({
        requester: new ObjectId(userId),
        recipient: new ObjectId(friendId),
    });
    if (result.deletedCount === 0) {
        throw new Error("Friendship request not found");
    }
}

export async function acceptFriendshipRequest(fastify: FastifyInstance, requestId: string) {
    const result = await fastify.mongo.db!.collection('friendships').updateOne(
        { requester: new ObjectId(requestId) },
        { $set: { status: 'accepted' } }
    );
    if (result.modifiedCount === 0) {
        throw new Error("Friendship request not found or already accepted");
    }
}

export async function getFriendshipCollection(fastify: FastifyInstance) {
    return fastify.mongo.db!.collection("friendships");
}