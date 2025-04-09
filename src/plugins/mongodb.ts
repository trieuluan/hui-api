import fp from 'fastify-plugin';
import fastifyMongo from 'fastify-mongodb';

export default fp(async (fastify) => {
    fastify.register(fastifyMongo, {
        url: process.env.MONGODB_URL || 'mongodb://localhost:27017/hui',
    });
})