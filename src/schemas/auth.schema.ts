export const registerUserSchema = {
    body: {
        type: 'object',
        required: ['emailOrPhone', 'password', 'retypePassword', 'fullName'],
        properties: {
            emailOrPhone: {
                oneOf: [
                    { type: 'string', format: 'email' },
                    { type: 'string', pattern: '^\\+?[1-9]\\d{1,14}$' } // E.164 phone format
                ]
            },
            password: { type: 'string', minLength: 6 },
            retypePassword: { type: 'string', minLength: 6 },
            fullName: { type: 'string', minLength: 1 }
        }
    }
};
