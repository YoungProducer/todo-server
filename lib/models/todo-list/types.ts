/** External imports */
import { Types, Document } from 'mongoose';

/** Application's imports */
import { TodoSchema } from '../todo';

export interface TodoListSchema {
    _id: string;
    todos: string[] | TodoListModel.PopulatedTodo[];
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export namespace TodoListModel {
    export type FromDB =
        & Document
        & TodoListSchema
        | null;

    export type PopulatedTodo = {
        [P in keyof TodoSchema]: TodoSchema[P];
    };

    export type FromDBPopulated =
        & Document
        & Omit<TodoListSchema, 'todos'>
        & {
            todos: PopulatedTodo[],
        }
        | null;

    export interface DeleteReturn {
        ok?: number;
        n?: number;
        deletedCount?: number;
    }

    export type AddPayload =
        | Pick<TodoListSchema, 'name'> & { todos?: string }
        | Pick<TodoListSchema, 'name'> & { todos?: string[] };

    export type GetPayload = string;

    export type DeletePayload = string;

    export type Add = (payload: AddPayload) => Promise<FromDB | FromDB[]>;
    export type Delete = (payload: DeletePayload) => Promise<DeleteReturn>;
    export type Get = (payload: GetPayload) => Promise<FromDBPopulated>;

    export interface Controller {
        add: Add;
        // delete: Delete;
        get: Get;
    }
}
