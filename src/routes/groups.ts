import {FastifyPluginAsync} from "fastify";
import {
    Group,
    groupCreateBodySchema, groupDeleteResponseSchema, GroupIdParam, groupIdParamSchema, GroupJoinBody, groupJoinBodySchema,
    groupSchema,
    groupUpdateBodySchema,
    listGroupSchema
} from "@/schemas/group.schema";
import {authMiddleware} from "@/middlewares/authMiddleware";
import {MongoServerError, ObjectId} from "mongodb";
import {groupMemberListSchema} from "@/schemas/groupMember.schema";
import { authorize } from "@/middlewares/authorize";
import { Permission } from "@/schemas/role.schema";

const groupRoutes: FastifyPluginAsync = async (fastify) => {
    // Middleware to check authentication
    fastify.addHook('onRequest', authMiddleware);

    fastify.get('/groups', {
        preHandler: authorize([Permission.GROUP_VIEW]),
        schema: {
            response: {
                200: listGroupSchema
            }
        }
    }, async (request, reply) => {
        try {
            const userId = request.auth.user?.id || (request.user as any)!.id;
            const groups = await fastify.groupModel.listByOwner(userId);
            reply.send(groups);
        } catch (error) {
            reply.status(500).send({ error: request.t('groups_fetch_fail') });
        }
    });

    fastify.get('/groups/:id', {
        preHandler: authorize([Permission.GROUP_VIEW]),
        schema: {
            params: groupIdParamSchema,
            response: {
                200: groupSchema
            }
        }
    }, async (request, reply) => {
        try {
            const { id } = request.params as GroupIdParam;
            const group = await fastify.groupModel.findById(id);
            if (!group) return reply.code(404).send({ message: request.t('group_not_found') });
            reply.send(group);
        } catch (error) {
            reply.status(500).send({ error: request.t('group_fetch_fail') });
        }
    });

    fastify.post('/groups', {
        preHandler: authorize([Permission.GROUP_CREATE]),
        schema: {
            body: groupCreateBodySchema,
            response: {
                200: groupSchema
            },
        }
    }, async (request, reply) => {
        try {
            const userId = new ObjectId(request.auth?.user?.id || (request.user as any)?.id); // 👈 lấy từ session hoặc token
            const body = request.body as Group;
            body.ownerId = userId;
            body.code = await fastify.counterModel.generateUniqueGroupCode();
            body.createdAt = new Date();
            const newGroup = await fastify.groupModel.createGroup(body);
            reply.status(201).send(newGroup);
        } catch (error: unknown) {
            if (error instanceof MongoServerError) {
                console.log(error.errInfo?.details.schemaRulesNotSatisfied[0]);
            }
            reply.status(500).send({ error: request.t('group_create_fail') });
        }
    });

    fastify.patch('/groups/:id', {
        preHandler: authorize([Permission.GROUP_UPDATE]),
        schema: {
            body: groupUpdateBodySchema,
            response: {
                200: groupSchema
            },
        }
    }, async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const body = request.body as Partial<Group>;
            const updatedGroup = await fastify.groupModel.updateById(id, body);
            reply.status(200).send(updatedGroup);
        } catch (error) {
            reply.status(500).send({ error: request.t('group_update_fail') });
        }
    });

    fastify.post('/groups/:id/join', {
        preHandler: authorize([Permission.GROUP_MEMBER_ADD]),
        schema: {
            params: groupIdParamSchema,
            body: groupJoinBodySchema,
        }
    }, async (request, reply) => {
        const userId = new ObjectId(request.auth.user!.id || (request.user as any)!.id); // 👈 lấy từ session hoặc token
        const groupId = new ObjectId((request.params as GroupIdParam).id);
        const { slots } = request.body as GroupJoinBody;
        const group = await fastify.groupModel.findById(groupId);
        if (!group) return reply.code(404).send({ message: request.t('group_not_found') });
        const totalCycles = group.totalCycles;
        const totalRegistered = await fastify.groupMemberModel.groupSlots(groupId.toString());
        if (totalRegistered! + slots > totalCycles) {
            return reply.code(400).send({
                message: request.t('total_slots_exceed', { total: totalRegistered! + slots, limit: totalCycles }),
            });
        }
        const result = await fastify.groupMemberModel.joinGroup(groupId, userId, slots);

        reply.status(200).send({
            message: request.t('join_success', { slots: result }),
        });
    });

    fastify.get('/groups/:id/members', {
        preHandler: authorize([Permission.GROUP_MEMBER_VIEW]),
        schema: {
            params: groupIdParamSchema,
            response: {
                200: groupMemberListSchema
            }
        }
    }, async (request, reply) => {
        const groupId = new ObjectId((request.params as GroupIdParam).id);
        const members = await fastify.groupMemberModel.getMembers(groupId);
        if (!members) return reply.code(404).send({ message: request.t('group_members_not_found') });
        reply.status(200).send(members);
    });

    fastify.delete('/groups/:id', {
        preHandler: authorize([Permission.GROUP_DELETE]),
        schema: {
            params: groupIdParamSchema,
            response: {
                200: groupDeleteResponseSchema
            }
        }
    }, async (request, reply) => {
        const userId = new ObjectId(request.auth?.user?.id || (request.user as any)!.id); // 👈 lấy từ session hoặc token
        const groupId = new ObjectId((request.params as GroupIdParam).id);
        const result = await fastify.groupModel.softDeleteById(groupId, userId);
        if (!result) return reply.code(404).send({ message: request.t('group_not_found') });
        reply.status(200).send({ success: true, message: request.t('group_delete_success') });
    });
};

export default groupRoutes;