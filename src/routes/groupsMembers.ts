import {FastifyPluginAsync} from "fastify";
import {authMiddleware} from "@/middlewares/authMiddleware";
import {GroupMemberApproveParams, groupMemberApproveParamsSchema} from "@/schemas/groupMember.schema";
import {z} from "zod";

const groupMemberRoutes: FastifyPluginAsync = async (fastify, opts) => {
    fastify.addHook('onRequest', authMiddleware);

    fastify.post('/group-members/:id/approve', {
        schema: {
            params: groupMemberApproveParamsSchema,
            body: z.object({}).optional(),
        }
    }, async (request, reply) => {
        const { id } = request.params as GroupMemberApproveParams;
        const groupMember = await fastify.groupMemberModel.findByIdStatusPending(id);
        if (!groupMember) {
            return reply.status(404).send({ message: 'Request join Hui not found.' });
        }
        await fastify.groupMemberModel.approve(id);
        return reply.status(200).send({ message: 'Request join Hui approved.' });
    });
}

export default groupMemberRoutes;