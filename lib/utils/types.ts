/** External imports */
import {
    FastifyInstance,
    FastifyRequest,
    FastifyReply,
} from 'fastify';
import {
    IncomingMessage,
    ServerResponse,
} from 'http';

export type Handler<T = void> = (
    req: FastifyRequest<IncomingMessage>,
    reply: FastifyReply<ServerResponse>,
) => Promise<T>;

export type HandlerWithInstance<T = void> = (
    req: FastifyRequest<IncomingMessage>,
    reply: FastifyReply<ServerResponse>,
    fastify: FastifyInstance,
) => Promise<T>;
