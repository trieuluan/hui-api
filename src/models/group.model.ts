import {FastifyInstance} from "fastify";
import {Group} from "@/schemas/group.schema";
import {ObjectId} from "mongodb";

export class GroupModel {
    private fi: FastifyInstance;

    constructor(fi: FastifyInstance) {
        this.fi = fi;
    }

    private collection() {
        return this.fi.mongo.db!.collection("groups");
    }

    getGroupCollection = () => {
        return this.collection();
    }

    async list(): Promise<Group[]> {
        return await this.collection().find({}).toArray() as Group[];
    }

    async listByOwner(ownerId: string): Promise<Group[]> {
        return await this.collection().find(
            {
                ownerId: new ObjectId(ownerId),
                $or: [
                    { deletedAt: { $exists: false } },
                    { deletedAt: null }
                ]
            }
        ).sort({ createdAt: -1 }).toArray() as Group[];
    }

    createGroup = async (group: Group): Promise<Group> => {
        const result = await this.collection().insertOne(group);
        return { _id: result.insertedId, ...group };
    }

    async findById(id: string | ObjectId): Promise<Group | null> {
        const result = await this.collection().findOne({ _id: new ObjectId(id) });
        if (!result) {
            return null;
        }
        return result as Group;
    }

    async updateById(id: string | ObjectId, data: Partial<Group>) {
        return this.collection().updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    ...data,
                    updated_at: new Date()
                }
            }
        );
    }

    async deleteById(id: string | ObjectId) {
        return this.collection().deleteOne({ _id: new ObjectId(id) });
    }

    async softDeleteById(id: string | ObjectId, deletedBy?: ObjectId) {
        return this.collection().updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    deletedAt: new Date(),
                    deletedBy: deletedBy,
                }
            }
        );
    }
}

declare module 'fastify' {
    interface FastifyInstance {
        groupModel: GroupModel;
    }
}