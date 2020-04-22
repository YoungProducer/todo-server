/** External imports */
import { Document } from 'mongoose';

/** Application's imports */
import { TodoModel } from '../models/todo';

export namespace Todo {
    export type Create = (payload: TodoModel.AddPayload) => ReturnType<TodoModel.Add>;
    export type Remove = (payload: TodoModel.RemovePayload) => Promise<TodoModel.FromDB>;
    export type RemoveMany = (payload: TodoModel.ManyPayload) => ReturnType<TodoModel.RemoveMany>;
    export type Get = (payload: TodoModel.RemovePayload) => Promise<TodoModel.FromDB>;
    export type GetMany = (payload: TodoModel.ManyPayload) => Promise<TodoModel.FromDB[]>;

    export interface Service {
        create: Create;
        remove: Remove;
        removeMany: RemoveMany;
        get: Get;
        getMany: GetMany;
    }
}
