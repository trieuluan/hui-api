export const friendshipResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        requester: { type: 'string' },
        recipient: { type: 'string' },
        status: { type: 'string', enum: ['pending', 'accepted', 'rejected'] },
        type: { type: 'string', enum: ['friend', 'block'] },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        friendId: { type: 'string' },
        friend: {
            type: 'object',
            properties: {
                _id: { type: 'string' },
                full_name: { type: 'string' },
                email: { type: 'string', format: 'email' },
                avatar_url: { type: 'string', format: 'uri' },
            },
            required: ['_id', 'full_name', 'email'],
            additionalProperties: false,
        }
    },
    additionalProperties: false,
}

export const ListFriendshipResponseSchema = {
    type: 'object',
    properties: {
        friendships: {
            type: 'array',
            items: friendshipResponseSchema
        }
    },
    additionalProperties: false,
}

export const friendshipRequestBodySchema = {
    type: 'object',
    required: ['friendId'],
    properties: {
        friendId: { type: 'string' },
    },
    additionalProperties: false,
}

export const friendshipACDBodySchema = {
    type: 'object',
    required: ['friendshipId'],
    properties: {
        friendshipId: { type: 'string' },
    },
    additionalProperties: false,
}