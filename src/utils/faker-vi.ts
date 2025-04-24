import { z } from 'zod';
import { faker as fakerVI } from '@faker-js/faker/locale/vi';
import { install, setFaker, fake } from 'zod-schema-faker';

// Thiết lập faker với locale tiếng Việt
setFaker(fakerVI);

// Cài đặt faker cho các kiểu dữ liệu Zod
install();

/**
 * Generate mock data từ Zod schema với faker tiếng Việt
 * @param schema - Zod schema cần generate
 * @param overrides - Ghi đè giá trị một số field nếu cần
 * @returns Dữ liệu giả phù hợp với schema
 */
export function generateWithFaker<T extends z.ZodTypeAny>(
    schema: T,
    overrides?: Partial<z.infer<T>>
): z.infer<T> {
    const data = fake(schema);
    return overrides ? { ...data, ...overrides } : data;
}
