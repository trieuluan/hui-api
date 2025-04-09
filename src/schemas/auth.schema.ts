export const registerUserSchema = {
    body: {
        type: 'object',
        required: ['email', 'password', 'retypePassword', 'fullName'],
        properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            retypePassword: { type: 'string', minLength: 6 },
            fullName: { type: 'string', minLength: 1 }
        }
    }
};
