/**
 * Created by: Oleksandr Bezrukov
 * Creation date: 8 March 2020
 *
 * Redefine fastify instance for correct decoreators usage.
 */


/** External imports */
import { Server, IncomingMessage, ServerResponse } from 'http';

/** Application's imports */
import { Todo } from '../../todo/types';

interface Config {
  JWT_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_ACCESS_COOKIES_MAX_AGE: string;
  JWT_REFRESH_EXPIRES_IN: string;
  JWT_REFRESH_COOKIES_MAX_AGE: string;
  JWT_SESSION_EXPIRES_IN: string;
  S3_BUCKET: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  CLIENT_ENDPOINT?: string;
  CLIENT_MOBILE_ENDPOINT?: string;
  ADMIN_ENDPOINT?: string;
  PORT?: string;
  HOST?: string;
  PROTOCOL?: string;
}

declare module 'fastify' {
  export interface FastifyInstance<
    HttpServer = Server,
    HttpRequest = IncomingMessage,
    HttpResponse = ServerResponse,
  > {
    config: Config;
    todoService: Todo.Service;
  }
}