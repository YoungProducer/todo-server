/** External imports */
import mongoose, { Model, Document } from 'mongoose';

/** Application's imports */
import { todoSchema } from './schema';
import { TodoSchema, TodoModel } from './types';
import { TodoListSchema } from '../todo-list';
import { todoListSchema } from '../todo-list/schema';

export * from './types';

interface SortedTodos {
    todoList: string;
    todos: Pick<TodoSchema, 'title'>[];
}

type SortByTodoListId =
    (payload: Omit<TodoSchema, '_id' | 'createdAt' | 'updatedAt'>[]) =>
    SortedTodos[];

const sortByTodoListId: SortByTodoListId = (payload) => {
    const sorted: SortedTodos[] = [];

    payload.forEach(todo => {
        const indexOfTodoList = sorted.findIndex(sortedTodos =>
            sortedTodos.todoList === todo.todoList);

        if (indexOfTodoList === -1) {
            sorted.push({ todoList: todo.todoList, todos: [{ title: todo.title }] });
        } else {
            sorted[indexOfTodoList].todos = [
                ...sorted[indexOfTodoList].todos,
                { title: todo.title },
            ];
        }
    });

    return sorted;
};

export class TodoModelController implements TodoModel.Controller {
    protected model: Model<Document & TodoSchema>;
    protected todoListModel: Model<Document & TodoListSchema>;

    constructor() {
        this.model = mongoose.model('Todo', todoSchema);
        this.todoListModel = mongoose.model('TodoList', todoListSchema);
    }

    add: TodoModel.Add = async (payload) => {
        const newTodo = await this.model.create(payload);

        if (!Array.isArray(payload)) {
            await this.todoListModel.updateOne({
                _id: payload.todoList,
            }, {
                $push: {
                    todos: newTodo._id,
                },
            });
        } else {
            const sorted = sortByTodoListId(payload);

            sorted.forEach(async el => {
                const newTodos = await this.model.create(payload.map(todo => ({
                    title: todo.title,
                    todoList: el.todoList,
                })));

                await this.todoListModel.updateOne({
                    _id: el.todoList,
                }, {
                    $push: {
                        todos: {
                            $each: newTodos.map(todo => todo._id),
                        },
                    },
                });
            });
        }

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
