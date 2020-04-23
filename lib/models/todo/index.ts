/** External imports */
import mongoose, { Model, Document } from 'mongoose';

/** Application's imports */
import { todoSchema } from './schema';
import { TodoSchema, TodoModel } from './types';

export * from './types';

export class TodoModelController implements TodoModel.Controller {
    protected model: Model<Document & TodoSchema>;

    constructor() {
        this.model = mongoose.model('Todo', todoSchema);
    }

    add: TodoModel.Add = async (payload) => {
        const newTodo = await this.model.create(payload);
        return newTodo;
    }

    remove: TodoModel.Remove = async (payload) => {
        const removedTodo = await this.model.deleteOne({
            _id: payload._id,
        });
        return removedTodo;
    }

    removeMany: TodoModel.RemoveMany = async (payload) => {
        const removedTodos = await this.model.deleteMany(payload);
        return removedTodos;
    }

    update: TodoModel.Update = async (payload) => {
        const updatedTodo = await this.model.updateOne(
            payload.where,
            payload.data,
        );
        return updatedTodo;
    }

    get: TodoModel.Get = async (payload) => {
        const todo = await this.model.findById(payload._id);
        return todo;
    }

    getMany: TodoModel.GetMany = async (payload) => {
        const todos = await this.model.find(payload);
        return todos;
    }
}
