import fp from 'fastify-plugin';
import fastifyMongodb from "@fastify/mongodb";
import {UserModel} from "@/models/user.model";
import {FriendshipModel} from "@/models/friendship.model";
import {GroupModel} from "@/models/group.model";
import {GroupMemberModel} from "@/models/groupMember.model";
import {CounterModel} from "@/models/counter.model";
import { RoleModel } from '@/models/role.model';

export default fp(async (fastify) => {
    fastify.register(fastifyMongodb, {
        url: process.env.MONGODB_URI || 'mongodb://localhost:27017/hui',
        forceClose: true
    });

    fastify.addHook("onReady", async () => {
        if (!fastify.mongo.client) {
            throw new Error("MongoDB client is not initialized");
        }
        fastify.log.info("✅ MongoDB connected successfully to database " + fastify.mongo.db?.databaseName);
    });

    fastify.after(async () => {
        fastify.decorate("userModel", new UserModel(fastify));
        fastify.decorate("friendshipModel", new FriendshipModel(fastify));
        fastify.decorate("groupModel", new GroupModel(fastify));
        fastify.decorate("groupMemberModel", new GroupMemberModel(fastify));
        fastify.decorate("roleModel", new RoleModel(fastify));
        const roleModel = fastify.roleModel;
        await roleModel.ensureDefaultRoles();
        const counterModel = new CounterModel(fastify);
        await counterModel.init();
        fastify.decorate("counterModel", counterModel);
    });
});