import fp from 'fastify-plugin';
import fastifyMongodb from "@fastify/mongodb";
import {UserModel} from "@/models/user.model";
import {FriendshipModel} from "@/models/friendship.model";
import {GroupModel} from "@/models/group.model";
import {GroupMemberModel} from "@/models/groupMember.model";

export default fp(async (fastify) => {
    fastify.register(fastifyMongodb, {
        url: process.env.MONGODB_URL || 'mongodb://localhost:27017/hui',
        forceClose: true
    });

    fastify.decorate("userModel", new UserModel(fastify));
    fastify.decorate("friendshipModel", new FriendshipModel(fastify));
    fastify.decorate("groupModel", new GroupModel(fastify));
    fastify.decorate("groupMemberModel", new GroupMemberModel(fastify));
});