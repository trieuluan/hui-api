import {FastifyPluginAsync} from "fastify";
import {registerUserSchema} from "@/schemas/auth.schema";
import {hashPassword, isPasswordStrong, verifyPassword} from "@/utils/password";
import {lucia} from "@/utils/lucia";
import {createUser, getUserCollection} from "@/models/user.model";
import * as repl from "node:repl";

const authRoutes: FastifyPluginAsync = async (fastify) => {
    const usersCollection = getUserCollection(fastify);
    fastify.post('/register', {
        schema: registerUserSchema
    }, async (request, reply) => {
        const { email, password, retypePassword, fullName } = request.body as any;
        // Validate password
        if (password !== retypePassword) {
            return reply.status(400).send({ message: "Passwords do not match" });
        }

        const passwordValidation = isPasswordStrong(password);
        if (passwordValidation.score < 2) {
            return reply.code(400).send({
                error: "Password is too weak",
                warning: passwordValidation.feedback.warning,
                suggestions: passwordValidation.feedback.suggestions,
            });
        }

        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return reply.status(400).send({ error: "Email đã tồn tại" });
        }

        const hashedPassword = await hashPassword(password);

        const user = await createUser(fastify, {
            email,
            password_hash: hashedPassword,
            full_name: fullName,
            role: 'chuhui', // Default role
            kyc: {
                status: 'pending', // Default KYC status
            }
        });

        const session = await lucia.createSession(user._id?.toString() as string, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        reply.setCookie(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes
        );

        reply.send({
            message: "User registered successfully",
            user: {
                _id: user._id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                created_at: user.created_at,
                updated_at: user.updated_at,
            },
            session_id: session.id
        });
    });

    fastify.post('/login', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 }
                },
                required: ['email', 'password']
            }
        }
    }, async (request, reply) => {
        const { email, password } = request.body as any;
        const user = await usersCollection.findOne({ email });
        if (!user) {
            return reply.status(401).send({ error: "Email hoặc mật khẩu không đúng" });
        }
        const match = await verifyPassword(password, user.password_hash);
        if (!match) {
            return reply.status(401).send({ error: "Email hoặc mật khẩu không đúng" });
        }
        const session = await lucia.createSession(user._id.toString(), {});
        const sessionCookie = lucia.createSessionCookie(session.id);

        reply.setCookie(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes
        );

        reply.send({
            message: "User login successfully",
            user: {
                _id: user._id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                created_at: user.created_at,
                updated_at: user.updated_at,
            },
            session_id: sessionCookie.value
        });
    });

    // Lấy user từ session
    fastify.get("/me", async (req, reply) => {
        console.log("🔥 fastify cookies:", req.cookies);
        console.log("🧾 session raw:", req.cookies[lucia.sessionCookieName]);
        console.log("📦 sessionId parsed:", lucia.readSessionCookie(req.cookies[lucia.sessionCookieName] as string));
        const sessionId = lucia.readSessionCookie(req.cookies[lucia.sessionCookieName] as string);
        if (!sessionId) return reply.status(401).send({ error: "Chưa đăng nhập", ...req.cookies });

        const { session, user } = await lucia.validateSession(sessionId);
        if (!session) return reply.status(401).send({ error: "Session không hợp lệ" });

        return reply.send({ user });
    });
};

export default authRoutes;