import { z } from "zod";
import {ObjectId} from "mongodb";

export const userSchema = z.object({
    _id: z.instanceof(ObjectId).optional(),
    full_name: z.string().min(1, "Tên không được để trống"),
    email: z.string().email().optional(),
    phone: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, "Số điện thoại không hợp lệ")
        .optional(),
    password_hash: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
    role: z.enum(["chuhui", "huivien"]),
    profile: z
        .object({
            dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Ngày sinh phải theo định dạng YYYY-MM-DD"),
            gender: z.enum(["male", "female", "other"]),
            address: z.string().min(1, "Địa chỉ không được để trống"),
        })
        .strict().optional(), // = additionalProperties: false
    kyc: z
        .object({
            status: z.enum(["pending", "verified", "rejected"]),
            id_number: z.string().optional(),
            id_type: z.enum(["cmnd", "cccd", "passport"]).optional(),
            id_front_url: z.string().url().optional(),
            id_back_url: z.string().url().optional(),
            selfie_url: z.string().url().optional(),
            verified_at: z.string().datetime().optional(),
        })
        .strict().optional(),
    status: z.enum(["active", "inactive"]).optional(),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
}).strict(); // Gốc cũng chặn additionalProperties

export const userCreateSchema = userSchema.omit({
    _id: true,
    created_at: true,
    updated_at: true,
}).strict();

// 👇 optional: tạo type cho schema này luôn
export type User = z.infer<typeof userSchema>;
export type UserCreate = z.infer<typeof userCreateSchema>;
