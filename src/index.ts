import Fastify from 'fastify';
import dotenv from 'dotenv';
const env = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${env}` });
import userRoutes from './routes/users';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import fastifyCookie from "@fastify/cookie";
import authRoutes from "./routes/auth";
import mongoPlugin from "./plugins/mongodb";
import * as process from "node:process";

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
await fastify.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET,
    parseOptions: {}, // options for parsing cookies
});
// Register MongoDB plugin
await fastify.register(mongoPlugin);
// Register user routes
await fastify.register(userRoutes);
// Register lucia authentication
await fastify.register(authRoutes);

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