/**
 * Đệ quy patch mọi trường có pattern yyyy-mm-dd thành format date + ví dụ
 */
export function patchSchemaDates(schema: any): any {
    const patchProperties = (node: any) => {
        if (node?.type === 'object' && node.properties) {
            for (const key of Object.keys(node.properties)) {
                const prop = node.properties[key];

                if (
                    prop?.type === 'string' &&
                    prop?.pattern === '^\\d{4}-\\d{2}-\\d{2}$'
                ) {
                    prop.format = 'date';
                } else if (prop?.type === 'object') {
                    patchProperties(prop);
                }
            }
        }
    };

    if (schema?.schema) {
        if (schema.schema.body) patchProperties(schema.schema.body);
        if (schema.schema.querystring) patchProperties(schema.schema.querystring);
        if (schema.schema.params) patchProperties(schema.schema.params);
        if (schema.schema.headers) patchProperties(schema.schema.headers);
        if (schema.schema.response) {
            for (const code of Object.keys(schema.schema.response)) {
                patchProperties(schema.schema.response[+code]);
            }
        }
    }

    return schema;
}
