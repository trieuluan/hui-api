import { lucia } from "@/utils/lucia";
import { FastifyReply, FastifyRequest } from "fastify";

export const unAuthMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
    const sessionId = lucia.readSessionCookie(request.headers.cookie ?? "");
    if (sessionId) {
        return reply.status(403).send({ message: "You are currently logged in." });
    }
};