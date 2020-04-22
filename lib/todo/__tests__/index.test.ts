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

    afterAll(async () => {
        await model.deleteMany({});
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
});
