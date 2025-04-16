import {FastifyPluginAsync} from "fastify";
import {
    changePasswordUserBodySchema,
    loginBodySchema,
    registerUserBodySchema,
    registerUserResponseSchema
} from "@/schemas/auth.schema";
import {hashPassword, isPasswordStrong, verifyPassword} from "@/utils/password";
import {lucia} from "@/utils/lucia";
import {authMiddleware} from "@/middlewares/authMiddleware";
import {unAuthMiddleware} from "@/middlewares/unAuthMiddleware";
import {parseEmailOrPhone} from "@/utils/parseEmailOrPhone";

const authRoutes: FastifyPluginAsync = async (fastify) => {
    const userModel = fastify.userModel;
    fastify.post('/register', {
        schema: {
            body: registerUserBodySchema,
            response: {
                200: registerUserResponseSchema
            }
        },
        preHandler: unAuthMiddleware,
    }, async (request, reply) => {
        const { emailOrPhone, password, retypePassword, fullName } = request.body as any;
        const parsed = parseEmailOrPhone(emailOrPhone);
        if (parsed.type === "invalid") {
            return reply.status(400).send({ message: "Invalid email or phone number" });
        }
        // Validate password
        if (password !== retypePassword) {
            return reply.status(400).send({ message: "Passwords do not match" });
        }

        const passwordValidation = isPasswordStrong(password);
        if (passwordValidation.score < 3) {
            return reply.code(400).send({
                error: "Password is too weak",
                warning: passwordValidation.feedback.warning,
                suggestions: passwordValidation.feedback.suggestions,
            });
        }

        const existingUser = await userModel.existsByEmailOrPhone(parsed.value);
        if (existingUser) {
            return reply.status(400).send({ error: "User đã tồn tại" });
        }

        const hashedPassword = await hashPassword(password);

        const paramsUser: any = {
            password_hash: hashedPassword,
            full_name: fullName,
            role: 'chuhui', // Default role
            kyc: {
                status: 'pending', // Default KYC status
            }
        }

        // Create the user
        if (parsed.type === "email") {
            paramsUser.email = parsed.value;
        }
        if (parsed.type === "phone") {
            paramsUser.phone = parsed.value;
        }
        const user = await fastify.userModel.createUser(paramsUser);

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
                phone: user.phone,
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
            body: loginBodySchema
        },
    }, async (request, reply) => {
        const { emailOrPhone, password } = request.body as any;
        const user = await userModel.existsByEmailOrPhone(emailOrPhone);
        if (!user) {
            return reply.status(401).send({ error: "User không tồn tại." });
        }
        const match = await verifyPassword(password, user.password_hash);
        if (!match) {
            return reply.status(401).send({ error: "Mật khẩu không đúng." });
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
    fastify.get("/me", {
        preHandler: authMiddleware
    }, async (req, reply) => {
        return reply.send({ user: req.auth.user });
    });

    // Logout
    fastify.post("/logout", {
        preHandler: authMiddleware
    }, async (req, reply) => {
        const sessionId = lucia.readSessionCookie(req.headers.cookie ?? "");
        if (!sessionId) {
            reply.status(204).send();
            return;
        }

        await lucia.invalidateSession(sessionId);
        const sessionCookie = lucia.createBlankSessionCookie();

        return reply
            .setCookie(
                sessionCookie.name,
                sessionCookie.value,
                sessionCookie.attributes
            )
            .status(200)
            .send({ message: "Logged out successfully" });
    });

    fastify.post("/change-password", {
        preHandler: authMiddleware,
        schema: {
            body: changePasswordUserBodySchema
        }
    }, async (req, reply) => {
        const { oldPassword, newPassword, retypeNewPassword } = req.body as any;
        const userId = req.auth.user?.id;
        const user = await fastify.userModel.findById(userId as string);
        if (!user) {
            return reply.status(404).send({ error: "User not found" });
        }

        const match = await verifyPassword(oldPassword, user.password_hash);
        if (!match) {
            return reply.status(401).send({ error: "Mật khẩu cũ không đúng" });
        }

        if (oldPassword === newPassword) {
            return reply.status(400).send({ error: "Mật khẩu mới không được giống mật khẩu cũ" });
        }

        if (newPassword !== retypeNewPassword) {
            return reply.status(400).send({ error: "Mật khẩu mới không khớp" });
        }
        const passwordValidation = isPasswordStrong(newPassword);
        console.log(passwordValidation);
        if (passwordValidation.score < 3) {
            return reply.code(400).send({
                error: "Mật khẩu mới quá yếu",
                warning: passwordValidation.feedback.warning,
                suggestions: passwordValidation.feedback.suggestions,
            });
        }

        user.password_hash = await hashPassword(newPassword);
        await fastify.userModel.updateById(user._id, user);

        return reply.send({ message: "Mật khẩu đã được thay đổi thành công" });
    })
};

export default authRoutes;