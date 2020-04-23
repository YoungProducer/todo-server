/** External imports */
import { Types, Document } from 'mongoose';

/** Application's imports */

export interface TodoListSchema {
    _id: Types.ObjectId;
    todos: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

export namespace TodoListModel {
    export type FromDB =
        & Document
        & TodoListSchema;

    export interface DeleteReturn {
        ok?: number;
        n?: number;
        deletedCount?: number;
    }

    export type AddPayload =
        | Types.ObjectId
        | Types.ObjectId[];

    export type DeletePayload = Types.ObjectId;

    export type Add = (payload: AddPayload) => Promise<FromDB | FromDB[]>;
    export type Delete = (payload: DeletePayload) => Promise<DeleteReturn>;

    export interface Controller {
        add: Add;
        delete: Delete;
    }
}
