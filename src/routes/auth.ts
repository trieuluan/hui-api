import {FastifyPluginAsync} from "fastify";
import {
    changePasswordUserBodySchema,
    loginBodySchema, loginResponseSchema,
    registerUserBodySchema,
    registerUserResponseSchema,
    checkPasswordBodySchema,
    checkPasswordResponseSchema
} from "@/schemas/auth.schema";
import {hashPassword, isPasswordStrong, verifyPassword} from "@/utils/password";
import {lucia} from "@/utils/lucia";
import {authMiddleware} from "@/middlewares/authMiddleware";
import {unAuthMiddleware} from "@/middlewares/unAuthMiddleware";
import {parseEmailOrPhone} from "@/utils/parseEmailOrPhone";
import {User, UserStatus} from "@/schemas/user.schema";
import { RoleName } from "@/schemas/role.schema";
import {appConfig} from "@/config/app_config";

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
        if (!passwordValidation.isStrong) {
            return reply.code(400).send({
                error: request.t('password_weak'),
                warning: passwordValidation.feedback.warning,
                suggestions: passwordValidation.feedback.suggestions,
                additionalErrors: passwordValidation.additionalValidation.errors,
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
        
        // Since UI has already validated user exists and password is correct,
        // we can optimize by directly getting user and creating session
        const user = await userModel.existsByEmailOrPhone(emailOrPhone);
        if (!user) {
            // Fallback validation in case of race condition or direct API call
            return reply.status(401).send({ error: request.t('user_not_found') });
        }
        
        // Quick password verification as final security check
        const match = await verifyPassword(password, user.password_hash);
        if (!match) {
            return reply.status(401).send({ error: request.t('password_not_right') });
        }
        
        // Create session and token
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
            permissions: user.permissions || []
        });

        const { password_hash, ...safeUser } = user;
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

        if (!passwordValidation.isStrong) {
            return reply.code(400).send({
                error: req.t('password_new_too_weak'),
                warning: passwordValidation.feedback.warning,
                suggestions: passwordValidation.feedback.suggestions,
                additionalErrors: passwordValidation.additionalValidation.errors,
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

    fastify.post('/auth/check-password', {
        schema: {
            body: checkPasswordBodySchema,
            response: {
                200: checkPasswordResponseSchema
            }
        }
    }, async (request, reply) => {
        const { emailOrPhone, password } = request.body as any;
        const user = await userModel.existsByEmailOrPhone(emailOrPhone);
        if (!user) {
            return reply.status(401).send({ error: request.t('user_not_found') });
        }
        const match = await verifyPassword(password, user.password_hash);
        if (!match) {
            return reply.status(401).send({ error: request.t('password_not_right') });
        }
        return reply.send({
            success: true,
            message: request.t('password_check_success'),
        });
    });

    fastify.get('/auth/password-config', {
        preHandler: unAuthMiddleware,
    }, async (request, reply) => {
        try {
            // Try to get from database first
            const settingsService = fastify.settingsService;
            const passwordSettings = await settingsService.getSettingsByCategory('password');
            
            if (Object.keys(passwordSettings).length > 0) {
                return reply.send({
                    minStrengthScore: passwordSettings.minStrengthScore || appConfig.password.minStrengthScore,
                    minLength: passwordSettings.minLength || appConfig.password.minLength,
                    maxLength: passwordSettings.maxLength || appConfig.password.maxLength,
                    requirements: {
                        uppercase: passwordSettings.requireUppercase ?? appConfig.password.requireUppercase,
                        lowercase: passwordSettings.requireLowercase ?? appConfig.password.requireLowercase,
                        numbers: passwordSettings.requireNumbers ?? appConfig.password.requireNumbers,
                        specialChars: passwordSettings.requireSpecialChars ?? appConfig.password.requireSpecialChars,
                    }
                });
            }
        } catch (error) {
            // Fallback to config if database fails
            console.warn('Failed to load password settings from database, using config:', error);
        }
        
        // Fallback to config
        return reply.send({
            minStrengthScore: appConfig.password.minStrengthScore,
            minLength: appConfig.password.minLength,
            maxLength: appConfig.password.maxLength,
            requirements: {
                uppercase: appConfig.password.requireUppercase,
                lowercase: appConfig.password.requireLowercase,
                numbers: appConfig.password.requireNumbers,
                specialChars: appConfig.password.requireSpecialChars,
            }
        });
    });

    fastify.post('/auth/check-password-strength', {
        preHandler: unAuthMiddleware,
    }, async (request, reply) => {
        const { password } = request.body as any;
        
        if (!password) {
            return reply.status(400).send({ 
                error: request.t('password_required') 
            });
        }
        
        const passwordValidation = isPasswordStrong(password);
        
        return reply.send({
            score: passwordValidation.score,
            feedback: passwordValidation.feedback,
            isStrong: passwordValidation.isStrong,
            additionalValidation: passwordValidation.additionalValidation,
        });
    });
};

export default authRoutes;