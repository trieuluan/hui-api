import Fastify from 'fastify';
import dotenv from 'dotenv';
import fastifyCookie from "@fastify/cookie";
import userRoutes from './routes/users';
import authRoutes from "./routes/auth";
import mongoPlugin from "./plugins/mongodb";
import {lucia} from "@/utils/lucia";
import {Session, User} from "lucia";
import friendshipRoutes from "@/routes/friendships";
import swagger from "@fastify/swagger";
import swaggerUI from '@fastify/swagger-ui';
import {jsonSchemaTransform, serializerCompiler, validatorCompiler,} from 'fastify-type-provider-zod';
import {z} from "zod";
import {patchSchemaDates} from "@/utils/zodSwaggerPatch";
import {registerZodErrorHandler} from "@/plugins/errorHandler";

const env = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${env}` });

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
registerZodErrorHandler(fastify);

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);


// Register Swagger for API documentation
fastify.register(swagger, {
    openapi: {
        info: {
            title: 'Hụi API',
            description: 'API quản lý hụi - Fastify + Zod',
            version: '1.0.0'
        },
    },
    transform: ({schema, url}) => {
        if (schema?.body instanceof z.ZodType || (schema?.response && (schema.response as Record<string, unknown>)['200'] instanceof z.ZodType)) {
            return patchSchemaDates(jsonSchemaTransform({schema, url}));
        }
        return { schema, url };
    },
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