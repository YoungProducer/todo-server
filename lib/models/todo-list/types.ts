/** External imports */
import { Types, Document, FilterQuery, UpdateQuery } from 'mongoose';

/** Application's imports */
import { TodoSchema } from '../todo';
import { TodoModel } from '../todo/types';

export interface TodoListSchema {
    _id: string;
    todos: string[] | TodoModel.Populated[];
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export namespace TodoListModel {
    export type FromDB =
        & Document
        & TodoListSchema
        | null;

    export type FromDBPopulated =
        & Document
        & Omit<TodoListSchema, 'todos'>
        & {
            todos: TodoModel.Populated[],
        }
        | null;

    export interface DeleteReturn {
        ok?: number;
        n?: number;
        deletedCount?: number;
    }

    export type ManyPayload = FilterQuery<TodoListSchema>;

    export type AddPayload =
        | Pick<TodoListSchema, 'name'> & { todos?: string }
        | Pick<TodoListSchema, 'name'> & { todos?: string[] };
    export type GetPayload = string;
    export type DeletePayload = string;
    export type UpdatePayload = any;

    export type Add = (payload: AddPayload) => Promise<
        | FromDB
        | FromDBPopulated>;
    export type Get = (payload: GetPayload) => Promise<FromDBPopulated>;
    export type GetMany = (payload: ManyPayload) => Promise<FromDBPopulated[]>;
    export type Delete = (payload: DeletePayload) => Promise<DeleteReturn>;
    export type DeleteMany = (payload: ManyPayload) => Promise<DeleteReturn>;
    export type Update = (
        filter: {
            _id: string,
        },
        data: UpdateQuery<Omit<TodoListSchema, 'todos'>>) => Promise<FromDBPopulated>;

    export interface Controller {
        add: Add;
        get: Get;
        getMany: GetMany;
        delete: Delete;
        deleteMany: DeleteMany;
        update: Update;
    }
}
