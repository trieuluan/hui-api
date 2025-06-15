import {FastifyError, FastifyPluginAsync} from 'fastify';
import { ZodError, ZodIssue } from 'zod';
import fp from "fastify-plugin";

/**
 * Đăng ký trình xử lý lỗi toàn cục cho Fastify, đặc biệt là ZodError.
 */
const registerZodErrorHandler: FastifyPluginAsync = fp(async (fastify) => {
    fastify.setErrorHandler((err: FastifyError | any, req, reply) => {
        // 1. Nếu là lỗi validate Zod
        if (err instanceof ZodError) {
            const issues = (err.issues as ZodIssue[]).map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            }));

            return reply.status(400).send({
                error: 'Validation failed',
                details: issues,
            });
        }

        // 2. Nếu là lỗi Fastify validation (JSON Schema)
        if (err.validation && Array.isArray(err.validation)) {
            const issues = err.validation.map((v: any) => {
                return {
                    field: v.instancePath?.replace(/^\//, '') || v.params?.missingProperty || 'unknown',
                    message: req.t?.(v.message, { defaultValue: v.message }) || 'Invalid value',
                };
            });

            return reply.status(400).send({
                error: 'Validation failed',
                details: issues,
            });
        }

        // 3. Nếu là lỗi không xác định
        req.log.error(err);
        return reply.status(500).send({
            error: 'Internal Server Error',
        });
    });
});

export default registerZodErrorHandler;