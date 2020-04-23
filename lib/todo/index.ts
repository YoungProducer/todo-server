/** External imports */
import fastify, {
    FastifyInstance,
    FastifyRequest,
    FastifyReply,
} from 'fastify';
import {
    IncomingMessage,
    ServerResponse,
} from 'http';

/** Application's imports */
import { add, get, getMany, remove, removeMany } from './schema';
import { HandlerWithInstance, Handler } from '../utils/types';
import { Todo } from './types';
import { TodoModel } from '../models/todo';

export const todoController = async (
    fastify: FastifyInstance,
    opts: any,
) => {
    fastify.post('/todo', { schema: add }, async (
        req: FastifyRequest<IncomingMessage>,
        reply: FastifyReply<ServerResponse>,
    ) => await createTodoHandler(req, reply, fastify));

    fastify.get('/todo/:_id', { schema: get }, async (
        req: FastifyRequest<IncomingMessage>,
        reply: FastifyReply<ServerResponse>,
    ) => await getTodoHandler(req, reply, fastify));
    fastify.get('/todo', { schema: getMany }, async (
        req: FastifyRequest<IncomingMessage>,
        reply: FastifyReply<ServerResponse>,
    ) => await getTodosHandler(req, reply, fastify));

    fastify.delete('/todo/:_id', { schema: remove }, async (
        req: FastifyRequest<IncomingMessage>,
        reply: FastifyReply<ServerResponse>,
    ) => await deleteTodoHandler(req, reply, fastify));
    fastify.delete('/todo', { schema: removeMany }, async (
        req: FastifyRequest<IncomingMessage>,
        reply: FastifyReply<ServerResponse>,
    ) => await deleteTodosHandler(req, reply, fastify));
};

const createTodoHandler: HandlerWithInstance = async (
    req,
    reply,
    fastify,
) => {
    const payload: TodoModel.AddPayload = req.body;

    try {
        const todo = await fastify.todoService.create(
            Array.isArray(payload)
                ? payload
                : ({ title: payload.title }),
        );
        reply.status(201).send(([] as TodoModel.FromDB[]).concat(todo));
    } catch (err) {
        reply.send(err);
    }
};

const getTodoHandler: HandlerWithInstance = async (
    req,
    reply,
    fastify,
) => {
    const params = req.params as any;

    try {
        const todo = await fastify.todoService.get(params);
        reply.send(todo);
    } catch (err) {
        reply.send(err);
    }
};

const getTodosHandler: HandlerWithInstance = async (
    req,
    reply,
    fastify,
) => {
    const query = req.query as any;

    const preparedPayload = query.filter
        ? JSON.parse(query.filter)
        : {};

    try {
        const todos = await fastify.todoService.getMany(preparedPayload);
        reply.send(todos);
    } catch (err) {
        reply.send(err);
    }
};

const deleteTodoHandler: HandlerWithInstance = async (
    req,
    reply,
    fastify,
) => {
    const payload = req.params as TodoModel.RemovePayload;

    try {
        const rmData = await fastify.todoService.remove(payload);
        reply.send(rmData);
    } catch (err) {
        reply.send(err);
    }
};

const deleteTodosHandler: HandlerWithInstance = async (
    req,
    reply,
    fastify,
) => {
    const query = req.query as any;

    const preparedPayload = query.filter
        ? JSON.parse(query.filter)
        : {};

    try {
        const removedData = await fastify.todoService.removeMany(preparedPayload);
        reply.send(removedData);
    } catch (err) {
        reply.send(err);
    }
};
