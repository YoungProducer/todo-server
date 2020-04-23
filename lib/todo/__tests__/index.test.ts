/** External imports */
import mongoose from 'mongoose';

/** Application's imports */
import { instance as fastify } from '../../index';
import { Model, Document } from 'mongoose';
import { TodoSchema } from '../../models/todo';
import { todoSchema } from '../../models/todo/schema';

describe('Todo controller', () => {
    const model: Model<Document & TodoSchema> = mongoose.model('Todo', todoSchema);

    beforeAll(async () => {
        await mongoose.connect('mongodb+srv://WithoutHands:Sasha080701@mycluster-qntjt.azure.mongodb.net/todo-dashboard-test?retryWrites=true&w=majority', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    afterEach(async () => {
        await model.deleteMany({});
    });

    afterAll(async () => {
        mongoose.disconnect();
    });

    test('/todo should return array with one created todo if payload is single object', async () => {
        const res = await fastify.inject({
            method: 'POST',
            url: '/todo',
            payload: {
                title: 'hello',
            },
        });

        expect(JSON.parse(res.payload)).toHaveLength(1);
    });

    test('/todo should return array with created todos if payload is array of objects', async () => {
        const res = await fastify.inject({
            method: 'POST',
            url: '/todo',
            payload: [{
                title: 'hello123123',
            }],
        });

        expect(JSON.parse(res.payload)).toHaveLength(1);
    });

    test('/todo should return todo if todo id is passed to params', async () => {
        const todo = await model.create({
            title: 'hello',
        });

        const res = await fastify.inject({
            method: 'GET',
            url: `/todo/${todo._id}`,
        });

        expect(
            (JSON.parse(res.payload) as TodoSchema).title,
        ).toBe('hello');
    });

    test(`/todo should return 'Not Found' error if todo id is invalid`, async () => {
        const res = await fastify.inject({
            method: 'GET',
            url: `/todo/5ea155c8d028d715777b2280`,
        });

        expect(res.statusCode).toBe(404);
    });

    test('/todo should return all todos if filter does not passed', async () => {
        await model.create([{
            title: 'hello',
        }, {
            title: 'world',
        }]);

        const res = await fastify.inject({
            method: 'GET',
            url: '/todo',
            query: {},
        });

        expect(JSON.parse(res.payload)).toHaveLength(2);
    });

    test('/todo should return only todos which fit to passed filter', async () => {
        await model.create([{
            title: 'hello',
        }, {
            title: 'world',
        }]);

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
});
