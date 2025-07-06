import {FastifyPluginAsync} from "fastify";
import {
    changePasswordUserBodySchema,
    loginBodySchema, loginResponseSchema,
    registerUserBodySchema,
    registerUserResponseSchema
} from "@/schemas/auth.schema";
import {hashPassword, isPasswordStrong, verifyPassword} from "@/utils/password";
import {lucia} from "@/utils/lucia";
import {authMiddleware} from "@/middlewares/authMiddleware";
import {unAuthMiddleware} from "@/middlewares/unAuthMiddleware";
import {parseEmailOrPhone} from "@/utils/parseEmailOrPhone";
import {User, UserStatus} from "@/schemas/user.schema";
import { RoleName } from "@/schemas/role.schema";
import { permission } from "process";

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
        const { emailOrPhone, password, retypePassword, fullName, email } = request.body as any;
        const parsed = parseEmailOrPhone(emailOrPhone);
        if (parsed.type === "invalid") {
            return reply.status(400).send({ message: request.t('email_phone_invalid') });
        }
        // Validate password
        if (password !== retypePassword) {
            return reply.status(400).send({ message: request.t('password_mismatch') });
        }

        const passwordValidation = isPasswordStrong(password);
        if (passwordValidation.score < 3) {
            return reply.code(400).send({
                error: request.t('password_weak'),
                warning: passwordValidation.feedback.warning,
                suggestions: passwordValidation.feedback.suggestions,
            });
        }

        const existingUser = await userModel.existsByEmailOrPhone(parsed.value);
        if (existingUser) {
            return reply.status(400).send({ error: request.t('user_exists') });
        }

        const hashedPassword = await hashPassword(password);

        const paramsUser: User = {
            password_hash: hashedPassword,
            full_name: fullName,
            role: RoleName.CHU_HUI, // Default role
            kyc: {
                status: 'pending', // Default KYC status
            },
            status: UserStatus.ACTIVE,
            email
        }

        // Create the user
        // if (parsed.type === "email") {
        //     paramsUser.email = parsed.value;
        // }
        if (parsed.type === "phone") {
            paramsUser.phone = parsed.value;
        }
        const user = await fastify.userModel.createUser(paramsUser);
        const { password_hash, ...safeUser } = user || {};

        const session = await lucia.createSession(user._id!.toString(), { permissions: user.permissions || [] });
        const sessionCookie = lucia.createSessionCookie(session.id);
        reply.setCookie(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes
        );
        const token = fastify.jwt.sign({
            id: user._id,
            email: user.email,
            phone: user.phone,
            full_name: user.full_name,
            role: user.role,
            permissions: user.permissions || [],
        });

        reply.send({
            success: true,
            message: request.t('user_register_success'),
            user: safeUser,
            token: token,
        });
    });

    fastify.post('/login', {
        schema: {
            body: loginBodySchema,
            response: {
                200: loginResponseSchema,
            }
        },
    }, async (request, reply) => {
        const { emailOrPhone, password } = request.body as any;
        const user = await userModel.existsByEmailOrPhone(emailOrPhone);
        const { password_hash, ...safeUser } = user || {};
        if (!user) {
            return reply.status(401).send({ error: request.t('user_not_found') });
        }
        const match = await verifyPassword(password, user.password_hash);
        if (!match) {
            return reply.status(401).send({ error: request.t('password_not_right') });
        }
        const session = await lucia.createSession(user._id!.toString(), { permissions: user.permissions || [] });
        const sessionCookie = lucia.createSessionCookie(session.id);
        reply.setCookie(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes
        );

        const token = fastify.jwt.sign({
            id: user._id,
            email: user.email,
            phone: user.phone,
            full_name: user.full_name,
            role: user.role,
        });

        reply.send({
            message: request.t('user_login_success'),
            user: safeUser,
            token,
            success: true,
        });
    });

    // Lấy user từ session
    fastify.get("/me", {
        preHandler: [authMiddleware]
    }, async (req, reply) => {
        return reply.send({ user: req.auth.user || req.user });
    });

    // Logout
    fastify.post("/logout", {
        preHandler: [authMiddleware]
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
            .send({ message: req.t('user_logout_success') });
    });

    fastify.post("/change-password", {
        preHandler: authMiddleware,
        schema: {
            body: changePasswordUserBodySchema
        }
    }, async (req, reply) => {
        const { oldPassword, newPassword, retypeNewPassword } = req.body as any;
        const userId = req.auth.user?.id || (req.user as any)!.id;
        const user = await fastify.userModel.findById(userId as string);
        if (!user) {
            return reply.status(404).send({ error: req.t('user_not_found') });
        }

        const match = await verifyPassword(oldPassword, user.password_hash);
        if (!match) {
            return reply.status(401).send({ error: req.t('password_old') });
        }

        if (oldPassword === newPassword) {
            return reply.status(400).send({ error: req.t('password_new_same_as_old') });
        }

        if (newPassword !== retypeNewPassword) {
            return reply.status(400).send({ error: req.t('password_new_mismatch') });
        }
        const passwordValidation = isPasswordStrong(newPassword);

        if (passwordValidation.score < 3) {
            return reply.code(400).send({
                error: req.t('password_new_too_weak'),
                warning: passwordValidation.feedback.warning,
                suggestions: passwordValidation.feedback.suggestions,
            });
        }

        user.password_hash = await hashPassword(newPassword);
        await fastify.userModel.updateById(user._id!, user);

        return reply.send({ message: req.t('password_change_success') });
    });

    fastify.post('/auth/check-availability', {
        schema: {
            body: registerUserBodySchema.pick({
                emailOrPhone: true
            })
        }
    }, async (request, reply) => {
        const { emailOrPhone } = request.body as any;
        const user = await userModel.existsByEmailOrPhone(emailOrPhone);
        return reply.send({ available: !!user });
    });
};

export default authRoutes;