import {FastifyInstance} from "fastify";
import {GroupMember, GroupMemberList} from "@/schemas/groupMember.schema";
import {ObjectId} from "mongodb";

export class GroupMemberModel {
    private fi: FastifyInstance;
    constructor(fi: FastifyInstance) {
        this.fi = fi;
    }
    private collection() {
        return this.fi.mongo.db!.collection("groupMembers");
    }
    getGroupMemberCollection = () => {
        return this.collection();
    }
    groupSlots = async (groupId: string): Promise<GroupMember['slots'] | null> => {
        const group = await this.collection().aggregate([
            { $match: { groupId: new ObjectId(groupId) } },
            { $group: { _id: "$groupId", totalSlots: { $sum: "$slots" } } },
        ]).toArray();
        if (!group) return null;
        return group[0]?.totalSlots;
    }
    joinGroup = async (groupId: ObjectId | string, userId: ObjectId | string, slots: number): Promise<GroupMember['slots']> => {
        const result = await this.collection().findOneAndUpdate(
            { groupId, userId },
            {
                $setOnInsert: {
                    joinedAt: new Date(),
                    status: 'pending',
                },
                $inc: { slots },
            },
            { upsert: true, returnDocument: 'after' }
        );
        return result!.slots;
    }
    findById = async (id: string | ObjectId): Promise<GroupMember | null> => {
        const result = await this.collection().findOne({ _id: new ObjectId(id) });
        if (!result) {
            return null;
        }
        return result as GroupMember;
    }
    findByIdStatusPending = async (id: string | ObjectId): Promise<GroupMember | null> => {
        const result = await this.collection().findOne({ _id: new ObjectId(id), status: 'pending' });
        if (!result) {
            return null;
        }
        return result as GroupMember;
    }
    approve = async (id: string | ObjectId): Promise<GroupMember | null> => {
        const result = await this.collection().findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { status: 'approved' } },
            { returnDocument: 'after' }
        );
        if (!result) {
            return null;
        }
        return result as GroupMember;
    }
    getMembers = async (groupId: string | ObjectId): Promise<GroupMemberList> => {
        const members = await this.collection().find({ groupId }).toArray();
        if (!members) {
            return { members: [], total: 0 };
        }
        return { members: members as GroupMember[], total: members.length };
    }
}

declare module 'fastify' {
    interface FastifyInstance {
        groupMemberModel: GroupMemberModel;
    }
}