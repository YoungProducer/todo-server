/** External imports */
import { Model, Document, Query, FilterQuery, Types } from 'mongoose';
import { todoSchema } from './schema';

export interface TodoSchema {
    _id: string;
    title: string;
    todoList: string;
    createdAt: Date;
    updatedAt: Date;
}

export namespace TodoModel {
    export type Populated = {
        [P in keyof TodoSchema]: TodoSchema[P];
    };

    export type AddPayload =
        | Omit<TodoSchema, '_id' | 'createdAt' | 'updatedAt'>
        | Omit<TodoSchema, '_id' | 'createdAt' | 'updatedAt'>[];

    export interface RemovePayload {
        _id: string;
    }

    export type ManyPayload = FilterQuery<TodoSchema>;

    export interface UpdatePayload {
        where: {
            _id: string;
        };
        data: Partial<Omit<TodoSchema,
            | '_id'
            | 'createdAt'
            | 'updatedAt'>>;
    }

    export interface GetPayload {
        _id: string;
    }

    export type FromDB = Document & TodoSchema | null;

    export interface DeleteReturn {
        ok?: number;
        n?: number;
        deletedCount?: number;
    }

    export type Add = (payload: AddPayload) => Promise<FromDB | FromDB[]>;
    export type Remove = (payload: RemovePayload) => Promise<{
        ok?: number | undefined;
        n?: number | undefined;
    } & {
        deletedCount?: number | undefined;
    }>;
    export type RemoveMany = (payload: ManyPayload) => Promise<DeleteReturn>;
    export type Update = (payload: UpdatePayload) => Promise<FromDB>;
    export type Get = (payload: GetPayload) => Promise<FromDB>;
    export type GetMany = (payload: ManyPayload) => Promise<FromDB[]>;

    export interface Controller {
        add: Add;
        remove: Remove;
        removeMany: RemoveMany;
        update: Update;
        get: Get;
        getMany: GetMany;
    }
}
