import { z } from 'zod';
import {userSchema} from "@/schemas/user.schema";
import libphonenumber from "google-libphonenumber";

const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();

export const registerUserBodySchema = z.object({
    emailOrPhone: z.union([
        z.string().email({ message: 'Email hoặc số điện thoại không hợp lệ' }),
        z.string().refine(value => {
            if (value.match(/^\+?[1-9]\d{1,14}$/)) {
                const phoneNumber = phoneUtil.parse(value);
                return phoneUtil.isValidNumber(phoneNumber);
            }
            return false
        }, { message: 'Email hoặc số điện thoại không hợp lệ' })
    ]),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    retypePassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    fullName: z.string().min(1, "Tên không được để trống"),
    email: z.string().email(),
});

export const registerUserResponseSchema = z.object({
    message: z.string(),
    user: userSchema.omit({
        password_hash: true
    }),
    token: z.string(),
    success: z.boolean().optional(),
}).strict();

export const changePasswordUserBodySchema = z.object({
    oldPassword: z.string().min(6, "Mật khẩu cũ không được để trống"),
    newPassword: z.string().min(6, "Mật khẩu mới không được để trống"),
    retypeNewPassword: z.string().min(6, "Mật khẩu xác nhận không được để trống")
}).strict();

export const loginBodySchema = registerUserBodySchema.pick({
    emailOrPhone: true,
    password: true
}).strict();

export const loginResponseSchema = z.object({
    message: z.string(),
    user: userSchema.omit({
        password_hash: true
    }),
    token: z.string(),
    success: z.boolean().optional(),
}).strict();

export type RegisterUserBody = z.infer<typeof registerUserBodySchema>;
export type RegisterUserResponse = z.infer<typeof registerUserResponseSchema>;
export type ChangePasswordUserBody = z.infer<typeof changePasswordUserBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;