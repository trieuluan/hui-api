import { z } from "zod";
import {ObjectId} from "mongodb";

// Enum types
const cycleUnitEnum = z.enum(['day', 'week', 'month']);
const groupStatusEnum = z.enum(['active', 'inactive', 'completed', 'paused']);

const baseGroupSchema = z.object({
    _id: z.instanceof(ObjectId).optional(),

    name: z.string()
        .min(1, 'Tên dây hụi không được để trống')
        .max(100, 'Tên dây hụi không được vượt quá 100 ký tự'),

    description: z.string().max(500).optional(),

    ownerId: z.instanceof(ObjectId), // Chủ hụi

    amountPerCycle: z.number().positive('Số tiền mỗi kỳ phải > 0'),

    cycleDuration: z.number().int().positive(),
    cycleUnit: cycleUnitEnum.default('week'),

    totalCycles: z.number().int().positive('Tổng số kỳ phải > 0'),

    maxMembers: z.number().int().positive().optional(),
    // Gợi ý: bạn có thể tính `maxMembers = totalCycles` mặc định, hoặc để frontend nhập

    autoStart: z.boolean().default(false),
    isPrivate: z.boolean().default(false),
    password: z.string().optional(),

    startDate: z.date().optional(),
    endDate: z.date().optional(),

    status: groupStatusEnum.default('inactive'),

    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
});

export const groupSchema = baseGroupSchema.strict();

export const listGroupSchema = z.array(groupSchema);

// 🎯 Hàm reuse refine logic
const withMaxMembersConstraint = <T extends z.ZodTypeAny>(schema: T) =>
    schema.refine(
        (data: any) => data.maxMembers === undefined || data?.maxMembers <= data?.totalCycles,
        {
            message: 'maxMembers không được vượt quá totalCycles',
            path: ['maxMembers'],
        }
    ).refine(data => {
        if (data.isPrivate) return !!data.password;
        return true;
    }, {
        message: "Group riêng tư cần có password",
        path: ["password"],
    });

export const groupCreateBodySchema = withMaxMembersConstraint(
    baseGroupSchema.omit({
        _id: true,
    }).strict()
);

export const groupUpdateBodySchema = withMaxMembersConstraint(
    baseGroupSchema.partial()
);

export const groupJoinParamSchema = z.object({
    id: z.string().refine((val) => ObjectId.isValid(val), {
        message: 'Invalid group ID',
    })
}).strict();

export const groupJoinBodySchema = z.object({
    slots: z.number().int().min(1),
}).strict();

export type Group = z.infer<typeof groupSchema>;
export type ListGroup = z.infer<typeof listGroupSchema>;
export type GroupCreateBody = z.infer<typeof groupCreateBodySchema>;
export type GroupUpdateBody = z.infer<typeof groupUpdateBodySchema>;
export type GroupJoinParam = z.infer<typeof groupJoinParamSchema>;
export type GroupJoinBody = z.infer<typeof groupJoinBodySchema>;