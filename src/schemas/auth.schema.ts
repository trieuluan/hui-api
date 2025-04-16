import { z } from 'zod';
import {userBodySchema} from "@/schemas/user.schema";

export const registerUserBodySchema = z.object({
    emailOrPhone: z.union([
        z.string().email(),
        z.string().regex(/^\+?[1-9]\d{1,14}$/, "Số điện thoại không hợp lệ")
    ]),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    retypePassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    fullName: z.string().min(1, "Tên không được để trống")
});

export const registerUserResponseSchema = z.object({
    message: z.string(),
    user: userBodySchema,
    session_id: z.string()
}).strict();

export const changePasswordUserBodySchema = z.object({
    oldPassword: z.string().min(6, "Mật khẩu cũ không được để trống"),
    newPassword: z.string().min(6, "Mật khẩu mới không được để trống"),
    retypeNewPassword: z.string().min(6, "Mật khẩu xác nhận không được để trống")
}).strict();

export const loginBodySchema = z.object({
    emailOrPhone: z.union([
        z.string().email('Email hoặc số điện thoại không hợp lệ'),
        z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Email hoặc số điện thoại không hợp lệ')
    ]),
    password: z.string().min(6, "Mật khẩu không được để trống")
}).strict();

export type RegisterUserBody = z.infer<typeof registerUserBodySchema>;
export type RegisterUserResponse = z.infer<typeof registerUserResponseSchema>;
export type ChangePasswordUserBody = z.infer<typeof changePasswordUserBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;