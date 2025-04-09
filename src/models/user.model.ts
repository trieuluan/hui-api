import { FastifyInstance } from "fastify";
import { User } from "@/types/user";

export async function getUsers(fastify: FastifyInstance): Promise<User[]> {
    return await fastify.mongo.db!.collection('users').find().toArray() as User[];
}

export async function createUser(fastify: FastifyInstance, user: User): Promise<User> {
    const result = await fastify.mongo.db!.collection('users').insertOne(user);
    return { _id: result.insertedId, ...user };
}

export const getUserCollection = (fastify: FastifyInstance) => {
    return fastify.mongo.db!.collection("users");
};