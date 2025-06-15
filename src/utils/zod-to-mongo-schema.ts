import { ZodTypeAny } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

/**
 * Chuyển đổi `type` → `bsonType` để tương thích MongoDB
 */
function convertToMongoSchema(schema: any): any {
    const mapping: Record<string, string> = {
        string: 'string',
        number: 'double',
        integer: 'int',
        boolean: 'bool',
        object: 'object',
        array: 'array',
    };

    if (schema.type) {
        if (mapping[schema.type]) {
            schema.bsonType = mapping[schema.type];
            delete schema.type;
        }
    }

    if (schema.bsonType === 'double') {
        schema.bsonType = ['int', 'double'];
    }

    if (schema.format === 'date-time') {
        schema.bsonType = 'date';
        delete schema.format;
    }

    // 💥 Remove unsupported fields
    if ('default' in schema) delete schema.default;
    if ('format' in schema) delete schema.format;

    if (schema.exclusiveMinimum !== undefined && typeof schema.exclusiveMinimum === 'number') {
        schema.minimum = schema.exclusiveMinimum;
        schema.exclusiveMinimum = true;
    }

    if (schema.exclusiveMaximum !== undefined && typeof schema.exclusiveMaximum === 'number') {
        schema.maximum = schema.exclusiveMaximum;
        schema.exclusiveMaximum = true;
    }

    if (schema.properties) {
        for (const key in schema.properties) {
            schema.properties[key] = convertToMongoSchema(schema.properties[key]);
        }
    }

    if (schema.items) {
        schema.items = convertToMongoSchema(schema.items);
    }

    for (const keyword of ['oneOf', 'anyOf', 'allOf']) {
        if (schema[keyword]) {
            schema[keyword] = schema[keyword].map(convertToMongoSchema);
        }
    }

    return schema;
}

/**
 * Chuyển Zod schema → MongoDB JSON Schema
 */
export function zodToMongoJsonSchema(zodSchema: any): any {
    const json = zodToJsonSchema(zodSchema);
    delete json.$schema;
    const schema = json.definitions?.[Object.keys(json.definitions)[0]] ?? json;
    return convertToMongoSchema(schema);
}

export function patchObjectIdFieldsRecursive(schema: any, objectIdFields: string[]) {
    if (!schema || typeof schema !== 'object') return;

    if (schema.type === 'object' || schema.bsonType === 'object') {
        const props = schema.properties;
        if (!props) return;

        for (const key of Object.keys(props)) {
            if (objectIdFields.includes(key)) {
                props[key].bsonType = 'objectId';
                delete props[key].type; // optional: tránh type conflict
            }

            // Đệ quy nếu có nested object
            patchObjectIdFieldsRecursive(props[key], objectIdFields);
        }
    }
}
