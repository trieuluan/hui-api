import { FastifyInstance } from "fastify";
import { User } from "@/types/user";
import {ObjectId} from "fastify-mongodb";

export async function getUsers(fastify: FastifyInstance): Promise<User[]> {
    return await fastify.mongo.db!.collection('users').find().toArray() as User[];
}

export async function createUser(fastify: FastifyInstance, user: User): Promise<User> {
    const result = await fastify.mongo.db!.collection('users').insertOne(user);
    return { _id: result.insertedId, ...user };
}

export async function getUserById(fastify: FastifyInstance, userId: string): Promise<User | null> {
    return await fastify.mongo.db!.collection('users').findOne({ _id: new ObjectId(userId) }) as User | null;
}

export async function updateUser(fastify: FastifyInstance, user: User): Promise<User> {
    const result = await fastify.mongo.db!.collection('users').updateOne(
        { _id: new ObjectId(user._id) },
        { $set: user }
    );
    return { _id: result.upsertedId, ...user };
}

export const getUserCollection = (fastify: FastifyInstance) => {
    return fastify.mongo.db!.collection("users");
};