// Import reflect metadata for dependency injection mechanism
import 'reflect-metadata';

/** External imports */
import path from 'path';
import fastify, { FastifyInstance, FastifyRequest, FastifyReply, SchemaCompiler } from 'fastify';
import fp from 'fastify-plugin';
import fastifyFormBody from 'fastify-formbody';
import fastifyCors from 'fastify-cors';
import jwt from 'fastify-jwt';
import fastifyCookie from 'fastify-cookie';
import fastifyStatic from 'fastify-static';
import { IncomingMessage, ServerResponse } from 'http';
import _ from 'lodash';
import mongoose from 'mongoose';

/** Application's imports */
import { registerSchemas } from './plugins/registerSchemas';
import { todoController } from './todo';
import { TodoService } from './todo/service';

/** Import env config */
if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const schema = {
    type: 'object',
    properties: {
        PORT: { type: 'string', default: '4000' },
        HOST: { type: 'string', default: 'localhost' },
        PROTOCOL: { type: 'string', default: 'http' },
    },
};

const init = async (fastify: FastifyInstance) => {
    const connection = await mongoose.connect('mongodb+srv://WithoutHands:Sasha080701@mycluster-qntjt.azure.mongodb.net/todo-dashboard?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
};

const decorateFastifyInstance = async (fastify: FastifyInstance) => {
    const todoService = new TodoService();
    fastify.decorate('todoService', todoService);

    fastify.addHook('onClose', (instance, done) => {
        mongoose.disconnect();
        done();
    });
};

const authenticator = async (fastify: FastifyInstance) => {
    const secret: string = process.env.JWT_SECRET || 'supersecret';
    fastify
        .register(jwt, {
            secret,
        });
};

const errorHandler = async (fastify: FastifyInstance) => {
    fastify.setErrorHandler((error, req, reply) => {
        if (error.statusCode) {
            reply
                .code(error.statusCode)
                .send({
                    statusCode: error.statusCode,
                    message: error.message,
                    errors: req.body && req.body.error ? req.body.error : undefined,
                });
        } else {
            reply.send(error);
        }
    });
};

const instance = fastify({
    pluginTimeout: 30000,
});

const production = process.env.NODE_ENV === 'production';
const development = process.env.NODE_ENV === 'development';

const clientEnpoint = process.env.CLIENT_ENDPOINT || 'http://localhost:8080';
const clientMobileEndpoint = process.env.CLIENT_MOBILE_ENDPOINT || 'http://localhost:8081';
const adminEndpoint = process.env.ADMIN_ENDPOINT || 'http://localhost:8082';

const uploadsPath = !development
    ? '../../uploads'
    : '../uploads';

instance
    .register(fastifyCors, {
        origin: [
            clientEnpoint,
            clientMobileEndpoint,
            adminEndpoint,
        ],
        credentials: true,
    })
    .register(fastifyStatic, {
        root: path.join(__dirname, uploadsPath),
        prefix: '/uploads/',
    })
    .register(require('fastify-env'), { schema })
    .register(fp(init))
    .register(fp(errorHandler))
    .register(fp(authenticator))
    .register(fp(decorateFastifyInstance))
    .register(fp(registerSchemas))
    .register(fastifyFormBody)
    .register(fastifyCookie)
    .register(require('fastify-file-upload'))
    .register(todoController);

export { instance };
