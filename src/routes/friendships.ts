import {FastifyPluginAsync, FastifyReply, FastifyRequest} from "fastify";
import {authMiddleware} from "@/middlewares/authMiddleware";
import {
    friendshipACDBodySchema,
    friendshipRequestBodySchema,
    ListFriendshipResponseSchema
} from "@/schemas/friendship.schema";
import {
    acceptFriendshipRequest,
    deleteFriendshipRequest,
    findFriendshipRequest,
    friendshipRequest,
    getFriendshipsList,
    findOneFriendshipByQuery
} from "@/models/friendship.model";
import {ObjectId} from "fastify-mongodb";

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

    // Request friendship
    fastify.post('/friendships/request', {
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
        const friendshipExists = await findFriendshipRequest(fastify, userId as string, friendId);
        if (friendshipExists) {
            if (friendshipExists.status === 'pending') {
                const message = friendshipExists.requester.toString() === userId ? 'Bạn đã gửi lời mời kết bạn rồi.' : 'Người dùng đã gửi lời mời kết bạn cho bạn.';
                return reply.status(400).send({ message });
            } else if (friendshipExists.status === 'accepted') {
                return reply.status(400).send({ message: 'Bạn đã là bạn bè rồi.' });
            }
        }
        const friendRequest = await friendshipRequest(fastify, userId as string, friendId);
        reply.status(200).send(friendRequest);
    });

    // Accept friendship request
    fastify.post('/friendships/accept', {
        schema: {
            description: 'Accept a friendship request',
            body: friendshipACDBodySchema,
        }
    }, async (request, reply) => {
        const { friendshipId } = request.body as any;
        const userId = request.auth.user?.id;
        const requestInDb = await findOneFriendshipByQuery(fastify, {
            $and: [
                {_id: new ObjectId(friendshipId)},
                {status: 'pending'}
            ]
        });
        if (!requestInDb) {
            return reply.status(404).send({ error: 'Friend request not found' });
        }
        if (requestInDb.recipient.toString() !== userId) {
            return reply.status(403).send({ error: 'Only recipient can accept the request' });
        }

        // Implement the logic to accept a friendship request
        // Example: await acceptFriendshipRequest(fastify, userId as string, friendId);
        await acceptFriendshipRequest(fastify, friendshipId);
        reply.status(200).send({ message: 'Đã chấp nhận lời mời kết bạn.' });
    });

    const handleCancelOrDecline = async (request: FastifyRequest, reply: FastifyReply) => {
        const action = request.routeOptions.url?.split('/').pop() || 'unknown';
        const { friendshipId } = request.body as any;
        const userId = request.auth.user?.id;

        const requestInDb = await findOneFriendshipByQuery(fastify, {
            $and: [
                {_id: new ObjectId(friendshipId)},
                {status: 'pending'}
            ]
        });
        if (!requestInDb) {
            return reply.status(404).send({ error: 'Friend request not found' });
        }

        // logic phân biệt action
        if (action === 'cancel' && requestInDb.requester.toString() !== userId) {
            return reply.status(403).send({ error: 'Only requester can cancel the request' });
        }

        if (action === 'decline' && requestInDb.recipient.toString() !== userId) {
            return reply.status(403).send({ error: 'Only recipient can decline the request' });
        }

        // Implement the logic to cancel a friendship request
        await deleteFriendshipRequest(fastify, friendshipId);
        reply.status(200).send({ message: 'Hủy Lời mời kết bạn thành công.' });
    };

    // Decline friendship request
    fastify.post('/friendships/decline', {
        schema: {
            description: 'Decline a friendship request',
            body: friendshipACDBodySchema,
        }
    }, handleCancelOrDecline);

    // Cancel friendship request
    fastify.post('/friendships/cancel', {
        schema: {
            description: 'Cancel a friendship request',
            body: friendshipACDBodySchema,
        }
    }, handleCancelOrDecline);

    // Remove friendship
    fastify.delete('/friendships/:friendshipId', {
        schema: {
            description: 'Remove a friendship',
            params: {
                type: 'object',
                properties: {
                    friendshipId: { type: 'string' },
                },
                required: ['friendshipId'],
            },
        }
    }, async (request, reply) => {
        const { friendshipId } = request.params as any;

        // Implement the logic to remove a friendship
        // Example: await removeFriendship(fastify, userId as string, friendId);
        await deleteFriendshipRequest(fastify, friendshipId);
        reply.status(200).send({ message: 'Đã xoá kết bạn.' });
    });
}

export default friendshipRoutes;