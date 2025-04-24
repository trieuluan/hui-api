import { lucia } from "@/utils/lucia";
import { FastifyReply, FastifyRequest } from "fastify";

export const authMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
    const sessionId = lucia.readSessionCookie(request.headers.cookie ?? "");
    let token;
    try {
        token = await request.jwtVerify();
    } catch (err) {
        console.log('No token found');
    }
    if (!sessionId && !token) {
        return reply.status(401).send({ message: "Unauthenticated" });
    }
    if (sessionId) {
        const { user, session } = await lucia.validateSession(sessionId);
        if (!user || !session) {
            return reply.status(401).send({ message: "Unauthenticated" });
        }

        request.auth = { user, session };
    }
};