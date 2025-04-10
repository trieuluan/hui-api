import {FastifyPluginAsync} from "fastify";
import {authMiddleware} from "@/middlewares/authMiddleware";
import {
    friendshipAcceptBodySchema,
    friendshipRequestBodySchema,
    ListFriendshipResponseSchema
} from "@/schemas/friendship.schema";
import {
    acceptFriendshipRequest,
    cancelFriendshipRequest,
    friendshipRequest,
    getFriendshipsList
} from "@/models/friendship.model";

const friendshipRoutes: FastifyPluginAsync = async (fastify) => {
    // Middleware to check authentication
    fastify.addHook('onRequest', authMiddleware);

    // Get all friendships
    fastify.get('/friendships', {
        schema: {
            response: {
                200: ListFriendshipResponseSchema
            }
        }
    }, async (request, reply) => {
        try {
            const userId = request.auth.user?.id;
            const friendships = await getFriendshipsList(fastify, userId as string);
            reply.status(200).send({ friendships });
        } catch (error) {
            reply.status(500).send({ error: 'Failed to fetch friendships' });
        }
    });

    // Add more friendship-related routes here
    fastify.post('/friendships', {
        schema: {
            description: 'Send a friendship request',
            body: friendshipRequestBodySchema,
        }
    }, async (request, reply) => {
        const { friendId } = request.body as any;
        const userId = request.auth.user?.id;
        if (friendId === userId) {
            return reply.status(400).send({ message: 'Bạn không thể kết bạn với chính mình.' });
        }
        const friendshipExists = await friendshipRequest(fastify, userId as string, friendId);
        if (friendshipExists) {
            if (friendshipExists.status === 'pending') {
                return reply.status(400).send({ message: 'Bạn đã gửi lời mời kết bạn rồi.' });
            } else if (friendshipExists.status === 'accepted') {
                return reply.status(400).send({ message: 'Bạn đã là bạn bè rồi.' });
            }
        }
        const friendRequest = await friendshipRequest(fastify, userId as string, friendId);
        reply.status(200).send(friendRequest);
    });

    // Cancel friendship request
    fastify.delete('/friendships', {
        schema: {
            description: 'Cancel a friendship request',
            body: friendshipRequestBodySchema,
        }
    }, async (request, reply) => {
        const { friendId } = request.body as any;
        const userId = request.auth.user?.id;

        // Implement the logic to cancel a friendship request
        // Example: await cancelFriendshipRequest(fastify, userId as string, friendId);
        await cancelFriendshipRequest(fastify, userId as string, friendId);
        reply.status(200).send({ message: 'Đã huỷ (Lời mời) kết bạn.' });
    });

    // Accept friendship request
    fastify.post('/friendships/accept', {
        schema: {
            description: 'Accept a friendship request',
            body: friendshipAcceptBodySchema,
        }
    }, async (request, reply) => {
        const { requestId } = request.body as any;

        // Implement the logic to accept a friendship request
        // Example: await acceptFriendshipRequest(fastify, userId as string, friendId);
        await acceptFriendshipRequest(fastify, requestId);
        reply.status(200).send({ message: 'Đã chấp nhận lời mời kết bạn.' });
    });
}

export default friendshipRoutes;