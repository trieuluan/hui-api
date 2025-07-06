import { z } from "zod";
import {ObjectId} from "mongodb";

// Enum types
const cycleUnitEnum = z.enum(['day', 'week', 'month']);
const groupStatusEnum = z.enum(['active', 'inactive', 'completed', 'paused']);

const baseGroupSchema = z.object({
    _id: z.instanceof(ObjectId).optional(),

    name: z.string()
        .min(1, 'group_name_required')
        .max(100, 'group_name_too_long'),

    description: z.string().max(500).nullable().optional(),

    code: z.string().regex(/^HF-\d{3,}$/, 'group_code_invalid').optional(),

    ownerId: z.instanceof(ObjectId), // Chủ hụi

    amountPerCycle: z.number().positive('amount_per_cycle_positive'),

    cycleDuration: z.number().int().positive('cycle_duration_positive'),
    cycleUnit: cycleUnitEnum.default('week'),
    cycleTime: z.string().regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'cycle_time_invalid').optional(),

    totalCycles: z.number().int().positive('total_cycles_positive'),

    maxMembers: z.number().int().positive().optional(),
    // Gợi ý: bạn có thể tính `maxMembers = totalCycles` mặc định, hoặc để frontend nhập

    autoStart: z.boolean().default(false),
    isPrivate: z.boolean().default(false),
    password: z.string().optional(),

    startDate: z.date().optional(),
    endDate: z.date().optional(),

    status: groupStatusEnum.default('inactive'),

    createdAt: z.date().default(() => new Date()).optional(),
    createdBy: z.instanceof(ObjectId).optional(),
    updatedAt: z.date().default(() => new Date()).optional(),
    deletedAt: z.date().optional(),
    deletedBy: z.instanceof(ObjectId).optional(),
});

export const groupSchema = baseGroupSchema.strict();

export const listGroupSchema = z.array(groupSchema);

// 🎯 Hàm reuse refine logic
const withMaxMembersConstraint = <T extends z.ZodTypeAny>(schema: T) =>
    schema.refine(
        (data: any) => data.maxMembers === undefined || data?.maxMembers <= data?.totalCycles,
        {
            message: 'member_count_exceeds_total_cycles',
            path: ['maxMembers'],
        }
    ).refine(data => {
        if (data.isPrivate) return !!data.password;
        return true;
    }, {
        message: 'private_group_requires_password',
        path: ["password"],
    });

export const groupCreateBodySchema = withMaxMembersConstraint(
    baseGroupSchema.omit({
        _id: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
    }).strict()
);

export const groupUpdateBodySchema = withMaxMembersConstraint(
    baseGroupSchema.partial()
);

export const groupIdParamSchema = z.object({
    id: z.string().refine((val) => ObjectId.isValid(val), {
        message: 'invalid_group_id',
    })
}).strict();

export const groupJoinBodySchema = z.object({
    slots: z.number().int().min(1),
}).strict();

export const groupDeleteResponseSchema = z.object({
    message: z.string().optional(),
    success: z.boolean().default(true),
}).strict();

export type Group = z.infer<typeof groupSchema>;
export type ListGroup = z.infer<typeof listGroupSchema>;
export type GroupCreateBody = z.infer<typeof groupCreateBodySchema>;
export type GroupUpdateBody = z.infer<typeof groupUpdateBodySchema>;
export type GroupIdParam = z.infer<typeof groupIdParamSchema>;
export type GroupJoinBody = z.infer<typeof groupJoinBodySchema>;