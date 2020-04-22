/** External imports */
import mongoose, { Model, Document } from 'mongoose';

/** Application's imports */
import { TodoModelController, TodoSchema, TodoModel } from '../todo';
import { todoSchema } from '../todo/schema';

type NonNullFromDB = Document & TodoSchema;

describe('TodoModelController', () => {
    const model: Model<Document & TodoSchema> = mongoose.model('Todo', todoSchema);
    const modelController = new TodoModelController();

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

    test('Create todo', async () => {
        await modelController.add({
            title: 'foo',
        });

        const foundTodo = await model.findOne({
            title: 'foo',
        });

        expect(foundTodo).not.toBeNull();
    });

    test('Create many todos', async () => {
        await modelController.add([{
            title: 'foo123',
        }, {
            title: 'bar123',
        }]);

        const foundTodos = await model.find({
            title: {
                $in: ['foo123', 'bar123'],
            },
        });

        expect(foundTodos).toHaveLength(2);
    });

    test('Read todo', async () => {
        const newTodo = await modelController.add({
            title: 'bar',
        }) as NonNullFromDB;

        const readTodo = await modelController.get(newTodo._id);

        expect(readTodo).not.toBeNull();
    });

    test('Read many', async () => {
        const todos = await modelController.getMany({
            title: {
                $in: ['foo', 'bar'],
            },
        });

        expect(todos.length).toBe(2);
    });

    test('Remove many', async () => {
        await modelController.add({ title: 'hello' });
        await modelController.add({ title: 'world' });

        const rmData = await modelController.removeMany({
            title: {
                $in: ['hello', 'world'],
            },
        });

        expect(rmData.deletedCount).toBe(2);
    });

    test('Update todo', async () => {
        const todo = await modelController.add({ title: 'baz' }) as NonNullFromDB;

        await modelController.update({
            where: {
                _id: todo._id,
            },
            data: {
                title: 'baz123',
            },
        });

        const updatedTodo = await model.findById(todo._id) as NonNullFromDB;

        expect(updatedTodo.title).toBe('baz123');
    });
});
