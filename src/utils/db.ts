import { FastifyInstance } from "fastify";

export const getMongoDb = (fastify: FastifyInstance) => {
    return fastify.mongo.db!;
};
