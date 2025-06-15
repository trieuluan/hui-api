import { FastifyPluginAsync } from 'fastify';
import {User, userCreateSchema, userSchema} from "@/schemas/user.schema";

const userRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/users', async (request, reply) => {
        try {
            const users = await fastify.userModel.list();
            reply.send(users);
        } catch (error) {
            reply.status(500).send({ error: request.t('fetch_users_fail') });
        }
    });
    fastify.post<{ Body: User }>('/users', {
        schema: {
            description: 'Create a new user',
            body: userCreateSchema,
            response: {
                201: userSchema,
            }
        }
    }, async (request, reply) => {
        try {
            const newUser = await fastify.userModel.createUser(request.body);
            reply.status(201).send(newUser);
        } catch (error) {
            reply.status(500).send({ error: request.t('user_create_fail') });
        }
    });
};

export default userRoutes;