import { lucia } from "@/utils/lucia";
import { FastifyReply, FastifyRequest } from "fastify";

export const authMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
    const sessionId = lucia.readSessionCookie(request.headers.cookie ?? "");
    if (!sessionId) {
        return reply.status(401).send({ message: "Unauthenticated" });
    }

    const { user, session } = await lucia.validateSession(sessionId);
    if (!user || !session) {
        return reply.status(401).send({ message: "Unauthenticated" });
    }

    request.auth = { user, session };
};