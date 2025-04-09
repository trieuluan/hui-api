import { FastifyPluginAsync } from 'fastify';
import { createUser, getUsers } from '@/models/user.model';
import { User } from '@/types/user';
import {userBodySchema} from "@/schemas/user.schema";

const userRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/users', async (request, reply) => {
        try {
            const users = await getUsers(fastify);
            reply.send(users);
        } catch (error) {
            reply.status(500).send({ error: 'Failed to fetch users' });
        }
    });

    fastify.post<{ Body: User }>('/users', {
        schema: {
            description: 'Create a new user',
            body: userBodySchema,
            response: {
                201: userBodySchema,
            }
        }
    }, async (request, reply) => {
        try {
            const newUser = await createUser(fastify, request.body);
            reply.status(201).send(newUser);
        } catch (error) {
            reply.status(500).send({ error: 'Failed to create user' });
        }
    });
};

export default userRoutes;