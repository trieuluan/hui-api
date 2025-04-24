import {FastifyPluginAsync} from "fastify";
import {
    Group,
    groupCreateBodySchema, GroupJoinBody, groupJoinBodySchema, GroupJoinParam, groupJoinParamSchema,
    groupSchema,
    groupUpdateBodySchema,
    listGroupSchema
} from "@/schemas/group.schema";
import {authMiddleware} from "@/middlewares/authMiddleware";
import {ObjectId} from "mongodb";
import {FastifyJWT} from "@fastify/jwt";
import {groupMemberListSchema} from "@/schemas/groupMember.schema";

const groupRoutes: FastifyPluginAsync = async (fastify) => {
    // Middleware to check authentication
    fastify.addHook('onRequest', authMiddleware);

    fastify.get('/groups', {
        schema: {
            response: {
                200: listGroupSchema
            }
        }
    }, async (request, reply) => {
        try {
            const { auth } = request;
            const groups = await fastify.groupModel.listByOwner(auth.user!.id);
            reply.send(groups);
        } catch (error) {
            console.log(error);
            reply.status(500).send({ error: 'Failed to fetch groups' });
        }
    });

    fastify.post('/groups', {
        schema: {
            body: groupCreateBodySchema,
            response: {
                200: groupSchema
            },
        }
    }, async (request, reply) => {
        try {
            const body = request.body as Group;
            const newGroup = await fastify.groupModel.createGroup(body);
            reply.status(201).send(newGroup);
        } catch (error) {
            reply.status(500).send({ error: 'Failed to create group' });
        }
    });

    fastify.patch('/groups/:id', {
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
            reply.status(500).send({ error: 'Failed to update group' });
        }
    });

    fastify.post('/groups/:id/join', {
        schema: {
            params: groupJoinParamSchema,
            body: groupJoinBodySchema,
        }
    }, async (request, reply) => {
        const userId = new ObjectId(request.auth.user!.id || (request.user as any)!.id); // 👈 lấy từ session hoặc token
        const groupId = new ObjectId((request.params as GroupJoinParam).id);
        const { slots } = request.body as GroupJoinBody;
        const group = await fastify.groupModel.findById(groupId);
        if (!group) return reply.code(404).send({ message: 'Không tìm thấy dây hụi' });
        const totalCycles = group.totalCycles;
        const totalRegistered = await fastify.groupMemberModel.groupSlots(groupId.toString());
        if (totalRegistered! + slots > totalCycles) {
            return reply.code(400).send({
                message: `Tổng suất (${totalRegistered! + slots}) vượt quá ${totalCycles}`,
            });
        }
        const result = await fastify.groupMemberModel.joinGroup(groupId, userId, slots);

        reply.status(200).send({
            message: 'Tham gia thành công. Số slot đã đăng ký: ' + result,
        });
    });

    fastify.get('/groups/:id/members', {
        schema: {
            params: groupJoinParamSchema,
            response: {
                200: groupMemberListSchema
            }
        }
    }, async (request, reply) => {
        const groupId = new ObjectId((request.params as GroupJoinParam).id);
        const members = await fastify.groupMemberModel.getMembers(groupId);
        if (!members) return reply.code(404).send({ message: 'Không tìm thấy thành viên nào' });
        reply.status(200).send(members);
    });
};

export default groupRoutes;