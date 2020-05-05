export const todoProperties = {
    _id: { type: 'string' },
    title: { type: 'string' },
};

export const todo = {
    $id: 'todo',
    type: 'object',
    required: ['_id', 'title'],
    properties: todoProperties,
    additionalProperties: true,
};

export const add = {
    body: {
        oneOf: [
            {
                type: 'object',
                required: ['title', 'todoList'],
                properties: {
                    title: { type: 'string' },
                    todoList: { type: 'string' },
                },
            }, {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['title'],
                    properties: {
                        title: { type: 'string' },
                    },
                },
            },
        ],
    },
    response: {
        200: {
            type: 'array',
            items: todo,
        },
    },
};

export const get = {
    params: {
        type: 'object',
        required: ['_id'],
        properties: {
            _id: { type: 'string' },
        },
    },
    response: {
        200: 'todo#',
    },
};

export const getMany = {
    querystring: {
        type: 'object',
        properties: {
            filter: {
                type: 'string',
            },
        },
    },
    response: {
        200: {
            type: 'array',
            items: { $ref: 'todo#' },
        },
    },
};

export const remove = {
    params: {
        type: 'object',
        required: ['_id'],
        properties: {
            _id: { type: 'string' },
        },
    },
    response: {
        200: {
            type: 'object',
            additionalProperties: false,
            properties: {
                ok: { type: 'number' },
                n: { type: 'number' },
                deletedCount: { type: 'number' },
            },
        },
    },
};

export const removeMany = {
    querystring: {
        type: 'object',
        properties: {
            filter: {
                type: 'string',
            },
        },
    },
    response: {
        200: {
            type: 'object',
            additionalProperties: false,
            properties: {
                ok: { type: 'number' },
                n: { type: 'number' },
                deletedCount: { type: 'number' },
            },
        },
    },
};
