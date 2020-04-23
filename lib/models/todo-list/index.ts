/** External imports */
import mongoose, { Document, Model, Types } from 'mongoose';

/** Application's imports */
import { TodoListModel, TodoListSchema } from './types';
import { todoListSchema } from './schema';
import { todoSchema } from '../todo/schema';
import { TodoModelController } from '../todo';
import { TodoModel, TodoSchema } from '../todo/types';

export * from './types';

export class TodoListModelController implements TodoListModel.Controller {
    protected model: Model<Document & TodoListSchema>;
    protected todoModel: Model<Document & TodoSchema>;
    protected todoModelController: TodoModel.Controller;

    constructor() {
        this.model = mongoose.model('TodoList', todoListSchema);
        this.todoModel = mongoose.model('Todo', todoSchema);
        this.todoModelController = new TodoModelController();
    }

    add: TodoListModel.Add = async (payload) => {
        if (!payload.todos || payload.todos.length === 0) {
            return await this.model.create({
                name: payload.name,
            });
        }

        let todoList = await this.model.create({
            name: payload.name,
        });

        if (payload.todos && payload.todos.length !== 0) {
            const createdTodos = await this.todoModel.create(
                Array.isArray(payload.todos) && payload.todos
                    ? payload.todos.map(todo => ({
                        title: todo,
                        todoList: todoList._id,
                    }))
                    : ({
                        title: payload.todos as string,
                        todoList: todoList._id,
                    }),
            );

            if (createdTodos !== null) {
                await this.model.updateOne({
                    _id: todoList._id,
                }, {
                    $push: {
                        todos: {
                            $each: Array.isArray(createdTodos)
                                ? createdTodos.reduce((acc, curr): string[] => {
                                    if (curr !== null) {
                                        return [...acc, curr._id];
                                    }

                                    return acc;
                                }, [] as string[])
                            : [createdTodos.title],
                        },
                    },
                });

                todoList = await this.model.findOne({
                    _id: todoList._id,
                }) as Document & TodoListSchema;
            }
        }

        return todoList;
    }

    get: TodoListModel.Get = async (_id) => {
        return await this.model.findOne({ _id })
            .populate('todos') as TodoListModel.FromDBPopulated;
    }

    getMany: TodoListModel.GetMany = async (payload) => {
        return await this.model.find(payload).populate('todos') as TodoListModel.FromDBPopulated[];
    }

    delete: TodoListModel.Delete = async (_id) => {
        await this.todoModel.deleteMany({
            todoList: _id,
        });

        return await this.model.deleteOne({ _id });
    }

    deleteMany: TodoListModel.DeleteMany = async (payload) => {
        const todoListsToDelete = await this.model.find(payload);

        await this.todoModel.deleteMany({
            todoList: {
                $in: todoListsToDelete.map(list => list._id),
            },
        });

        return await this.model.deleteMany(payload);
    }
}
