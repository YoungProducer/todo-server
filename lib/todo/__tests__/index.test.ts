/** External imports */
import mongoose from 'mongoose';

/** Application's imports */
import { instance as fastify } from '../../index';
import { Model, Document } from 'mongoose';
import { TodoSchema, TodoModel, TodoModelController } from '../../models/todo';
import { todoSchema } from '../../models/todo/schema';
import { TodoListModelController, TodoListSchema } from '../../models/todo-list';
import { Todo } from '../types';

describe('Todo controller', () => {
    const model: Model<Document & TodoSchema> = mongoose.model('Todo', todoSchema);
    const todoModelController = new TodoModelController();
    const todoListModelController = new TodoListModelController();

    beforeAll(async () => {
        await mongoose.connect('mongodb+srv://WithoutHands:Sasha080701@mycluster-qntjt.azure.mongodb.net/todo-dashboard-test?retryWrites=true&w=majority', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    afterEach(async () => {
        await todoModelController.removeMany({});
        await todoListModelController.deleteMany({});
    });

    afterAll(async () => {
        mongoose.disconnect();
    });

    test('POST /todo should return array with one created todo if payload is single object', async () => {
        const todoList = await todoListModelController.add({
            name: 'first',
        }) as NonNullable<Document & TodoListSchema>;

        const res = await fastify.inject({
            method: 'POST',
            url: '/todo',
            payload: {
                title: 'hello',
                todoList: todoList._id,
            },
        });

        expect(res.statusCode).toBe(201);
        expect(JSON.parse(res.payload)).toHaveLength(1);
    });

    test('POST /todo should return array with created todos if payload is array of objects', async () => {
        const todoList = await todoListModelController.add({
            name: 'first',
        }) as NonNullable<Document & TodoListSchema>;

        const res = await fastify.inject({
            method: 'POST',
            url: '/todo',
            payload: [{
                title: 'hello123123',
                todoList: todoList._id,
            }],
        });

        expect(res.statusCode).toBe(201);
        expect(JSON.parse(res.payload)).toHaveLength(1);
    });

    test('GET /todo should return todo if todo id is passed to params', async () => {
        const todoList = await todoListModelController.add({
            name: 'first',
        }) as NonNullable<Document & TodoListSchema>;

        const todo = await todoModelController.add({
            title: 'hello',
            todoList: todoList._id,
        }) as NonNullable<Document & TodoSchema>;

        const res = await fastify.inject({
            method: 'GET',
            url: `/todo/${todo._id}`,
        });

        expect(
            (JSON.parse(res.payload) as TodoSchema).title,
        ).toBe('hello');
    });

    test(`GET /todo should return 'Not Found' error if todo id is invalid`, async () => {
        const res = await fastify.inject({
            method: 'GET',
            url: `/todo/5ea155c8d028d715777b2280`,
        });

        expect(res.statusCode).toBe(404);
    });

    test('GET /todo should return all todos if filter does not passed', async () => {
        const todoList = await todoListModelController.add({
            name: 'first',
            todos: ['hello', 'world'],
        }) as NonNullable<Document & TodoListSchema>;

        const res = await fastify.inject({
            method: 'GET',
            url: '/todo',
            query: {},
        });

        expect(JSON.parse(res.payload)).toHaveLength(2);
    });

    test('GET /todo should return only todos which fit to passed filter', async () => {
        const todoList = await todoListModelController.add({
            name: 'first',
            todos: ['hello', 'world'],
        }) as NonNullable<Document & TodoListSchema>;

        const res = await fastify.inject({
            method: 'GET',
            url: `/todo`,
            query: {
                filter: JSON.stringify({
                    title: {
                        $in: ['hello'],
                    },
                }),
            },
        });

        expect(JSON.parse(res.payload)).toHaveLength(1);
    });

    test('GET /todo should return error 404 if there are not todos which fit to filter', async () => {
        const res = await fastify.inject({
            method: 'GET',
            url: '/todo',
            query: {
                filter: JSON.stringify({
                    title: '123',
                }),
            },
        });

        expect(res.statusCode).toBe(404);
    });

    test('DELETE /todo should return remove data if request contains valid id in params', async () => {
        const todoList = await todoListModelController.add({
            name: 'first',
        }) as NonNullable<Document & TodoListSchema>;

        const todo = await todoModelController.add({
            title: 'hello',
            todoList: todoList._id,
        }) as NonNullable<Document & TodoSchema>;

        const res = await fastify.inject({
            method: 'DELETE',
            url: `/todo/${todo._id}`,
        });

        expect((JSON.parse(res.payload) as TodoModel.DeleteReturn).deletedCount).toBe(1);
    });

    test('DELETE /todo should return error 404 if request contains invalid id in params', async () => {
        const res = await fastify.inject({
            method: 'DELETE',
            url: `/todo/5ea155c8d028d715777b2280`,
        });

        expect(res.statusCode).toBe(404);
    });

    test('DELETE /todo should return remove data if todos exist which fit to filter', async () => {
        const todoList = await todoListModelController.add({
            name: 'first',
            todos: ['foo', 'bar'],
        }) as NonNullable<Document & TodoListSchema>;

        const res = await fastify.inject({
            method: 'DELETE',
            url: '/todo',
            query: {
                filter: JSON.stringify({
                    title: {
                        $in: ['foo', 'bar'],
                    },
                }),
            },
        });

        expect((JSON.parse(res.payload) as TodoModel.DeleteReturn).deletedCount).toBe(2);
    });

    test('DELETE /todo should return error 404 if there are not todos which fit to filter', async () => {
        const res = await fastify.inject({
            method: 'DELETE',
            url: '/todo',
            query: {
                filter: JSON.stringify({
                    title: {
                        $in: ['foo', 'bar'],
                    },
                }),
            },
        });

        expect(res.statusCode).toBe(404);
    });
});
