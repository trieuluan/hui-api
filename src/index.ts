import Fastify from 'fastify';
import dotenv from 'dotenv';
const env = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${env}` });
import fastifyCookie from "@fastify/cookie";
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import userRoutes from './routes/users';
import authRoutes from "./routes/auth";
import mongoPlugin from "./plugins/mongodb";
import {lucia} from "@/utils/lucia";
import {Session, User} from "lucia";
import friendshipRoutes from "@/routes/friendships";

const fastify = Fastify({
    logger: {
        transport: {
            target: 'pino-pretty', // log đẹp hơn khi dev
            options: {
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname'
            }
        }
    },
});

// Register Swagger for API documentation
fastify.register(swagger, {
    swagger: {
        info: {
            title: 'Fastify API',
            description: 'REST API with Fastify + MongoDB',
            version: '1.0.0'
        },
        host: `localhost:${process.env.PORT || 3000}`,
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json']
    }
});

fastify.register(swaggerUI, {
    routePrefix: '/docs', // Documentation route
    staticCSP: true,
    transformStaticCSP: (header: any) => header,
    uiConfig: {
        docExpansion: 'full',
        deepLinking: false,
    },
});

// Register fastify cookie for session management
fastify.register(fastifyCookie);
fastify.addHook("preHandler", async (request) => {
    const sessionId = lucia.readSessionCookie(request.headers.cookie ?? "");
    if (!sessionId) {
        request.auth = { user: null, session: null };
        return;
    }

    const { user, session } = await lucia.validateSession(sessionId);
    request.auth = { user, session };
});
declare module "fastify" {
    interface FastifyRequest {
        auth: {
            user: User | null;
            session: Session | null;
        };
    }
}
// Register MongoDB plugin
fastify.register(mongoPlugin);
// Register user routes
fastify.register(userRoutes);
// Register lucia authentication
fastify.register(authRoutes);
// Register friendship routes
fastify.register(friendshipRoutes);

// Start server
const start = async () => {
    try {
        await fastify.listen({ port: Number(process.env.PORT) || 3000 });
        fastify.log.info(`Server is running at http://localhost:${process.env.PORT}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();