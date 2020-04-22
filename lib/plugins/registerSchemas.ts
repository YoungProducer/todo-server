/** External imports */
import { FastifyInstance } from 'fastify';

/** Application's imports */
import { todo } from '../todo/schema';

export const registerSchemas = async (fastify: FastifyInstance) => {
    fastify.addSchema(todo);
};
