import { GroupCreateBody } from '@/schemas/group.schema';
import {faker} from "@faker-js/faker/locale/vi";

export function sanitizeGroupCreateInput(data: GroupCreateBody): GroupCreateBody {
    return {
        ...data,
        maxMembers: data.maxMembers ?? data.totalCycles,
    };
}

export function generateE164Phone(): string {
    // luôn có dấu '+' hoặc không, tuỳ bạn (ở đây mặc định có '+')
    const prefix = '+';
    // Chọn chữ số đầu tiên từ 1–9
    const first = faker.number.int({ min: 1, max: 9 }).toString();
    // Sinh ngẫu nhiên 0–14 chữ số tiếp theo (có thể 0 chữ số để total=1)
    const restLength = faker.number.int({ min: 0, max: 14 });
    const rest = faker.string.numeric(restLength);
    return `${prefix}${first}${rest}`;
}