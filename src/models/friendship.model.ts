import {FastifyInstance} from "fastify";
import {Friendship} from "@/types/friendships";
import {Filter, ObjectId} from "mongodb";

export class FriendshipModel {
    private fi: FastifyInstance;

    constructor(fi: FastifyInstance) {
        this.fi = fi;
    }

    private collection() {
        return this.fi.mongo.db!.collection("friendships");
    }

    list = async (userId: string) => {
        return await this.collection().aggregate([
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
        ]).toArray()
    }

    request = async (userId: string, friendId: string): Promise<Friendship> => {
        const friendship: Friendship = {
            requester: new ObjectId(userId),
            recipient: new ObjectId(friendId),
            status: "pending",
            type: 'friend',
            created_at: new Date(),
        };
        const result = await this.collection().insertOne(friendship);
        return { _id: result.insertedId, ...friendship };
    }

    findRequest = async (userId: string, friendId: string): Promise<Friendship | null> => {
        return await this.collection().findOne({
            $or: [
                { requester: new ObjectId(userId), recipient: new ObjectId(friendId) },
                { requester: new ObjectId(friendId), recipient: new ObjectId(userId) }
            ]
        }) as Friendship;
    }

    acceptRequest = async (friendshipId: string) => {
        const result = await this.collection().updateOne(
            { _id: new ObjectId(friendshipId), status: 'pending' },
            { $set: { status: 'accepted' } }
        );
        if (result.modifiedCount === 0) {
            throw new Error("Friendship request not found or already accepted");
        }
    }

    deleteRequest = async (friendshipId: string) => {
        const result = await this.collection().deleteOne({ _id: new ObjectId(friendshipId) });
        if (result.deletedCount === 0) {
            throw new Error("Friendship request not found");
        }
    }

    findOneByQuery = async (filter: Filter<any>) => {
        const friendship = await this.collection().findOne(filter);
        if (!friendship) {
            throw new Error("Friendship request not found");
        }
        return friendship;
    }
}

declare module 'fastify' {
    interface FastifyInstance {
        friendshipModel: FriendshipModel;
    }
}