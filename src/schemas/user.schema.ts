import { z } from "zod";

export const userBodySchema = z.object({
    _id: z
        .string()
        .regex(/^[a-fA-F0-9]{24}$/, "_id phải là ObjectId hợp lệ")
        .optional(),
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
        .strict(), // = additionalProperties: false
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
        .strict(),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
}).strict(); // Gốc cũng chặn additionalProperties

// 👇 optional: tạo type cho schema này luôn
export type UserBody = z.infer<typeof userBodySchema>;
