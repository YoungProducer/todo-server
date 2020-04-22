/** External imports */
import HttpErrors from 'http-errors';

/** Application's imports */
import { TodoModelController, TodoModel } from '../models/todo';
import { Todo } from './types';

export class TodoService implements Todo.Service {
    modelController!: TodoModel.Controller;

    constructor() {
        this.modelController = new TodoModelController();
    }

    create: Todo.Create = async (payload) => {
        return await this.modelController.add(payload);
    }

    remove: Todo.Remove = async (payload) => {
        const removedTodo = await this.modelController.remove(payload);

        if (removedTodo === null) {
            throw new HttpErrors.NotFound(
                `There is not todo with this id: ${payload._id}.`,
            );
        }

        return removedTodo;
    }

    removeMany: Todo.RemoveMany = async (payload) => {
        const rmData = await this.modelController.removeMany(payload);

        if (!rmData.deletedCount || rmData.deletedCount === 0) {
            throw new HttpErrors.NotFound(
                `There are not todo which fit under this filter: ${payload}.`,
            );
        }

        return await this.modelController.removeMany(payload);
    }

    get: Todo.Get = async (payload) => {
        const todo = await this.modelController.get(payload);

        if (todo === null) {
            throw new HttpErrors.NotFound(
                `There is not todo with this id: ${payload._id}.`,
            );
        }

        return todo;
    }

    getMany: Todo.GetMany = async (payload) => {
        const todos = await this.modelController.getMany(payload);

        if (todos.length === 0) {
            throw new HttpErrors.NotFound(
                `There are not todos with this filter: ${payload}.`,
            );
        }

        return todos;
    }
}
