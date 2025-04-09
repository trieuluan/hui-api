export const userBodySchema = {
    type: 'object',
    required: ['email', 'full_name', 'password_hash', 'role'],
    properties: {
        _id: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' },
        full_name: { type: 'string', minLength: 1 },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string', pattern: '^\\+?[1-9]\\d{1,14}$' },
        password_hash: { type: 'string', minLength: 8 },
        role: { type: 'string', enum: ['chuhui', 'huivien'] },
        profile: {
            type: 'object',
            properties: {
                dob: { type: 'string', format: 'date' }, // ISO format
                gender: { type: 'string', enum: ['male', 'female', 'other'] },
                address: { type: 'string', minLength: 1 },
            },
            required: ['dob', 'gender', 'address'],
            additionalProperties: false,
        },
        kyc: {
            type: 'object',
            properties: {
                status: { type: 'string', enum: ['pending', 'verified', 'rejected'] },
                id_number: { type: 'string' },
                id_type: { type: 'string', enum: ['cmnd', 'cccd', 'passport'] },
                id_front_url: { type: 'string', format: 'uri' },
                id_back_url: { type: 'string', format: 'uri' },
                selfie_url: { type: 'string', format: 'uri' },
                verified_at: { type: 'string', format: 'date-time' },
            },
            required: ['status'],
            additionalProperties: false,
        },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
    },
    additionalProperties: false,
}