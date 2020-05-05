/** External imports */
import mongoose, { Model, Document } from 'mongoose';
import HttpErrors from 'http-errors';

/** Application's imports */
import { TodoService } from '../service';
import { TodoSchema } from '../../models/todo';
import { todoSchema } from '../../models/todo/schema';
import { TodoListModelController, TodoListSchema } from '../../models/todo-list';

type NonNullFromDB = Document & TodoSchema;

describe('Todo service', () => {
    const model: Model<Document & TodoSchema> = mongoose.model('Todo', todoSchema);
    const service = new TodoService();
    const todoListModelController = new TodoListModelController();

    beforeAll(async () => {
        await mongoose.connect('mongodb+srv://WithoutHands:Sasha080701@mycluster-qntjt.azure.mongodb.net/todo-dashboard-test?retryWrites=true&w=majority', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    afterEach(async () => {
        await model.deleteMany({});
        await todoListModelController.deleteMany({});
    });

    afterAll(async () => {
        mongoose.disconnect();
    });

    test('create method should return created todo if passed object', async () => {
        const todoList = await todoListModelController.add({
            name: 'first',
        }) as NonNullable<Document & TodoListSchema>;

        const createdTodo = await service.create({
            title: 'user123',
            todoList: todoList._id,
        }) as NonNullFromDB;

        expect(createdTodo.title).toBe('user123');
    });

    test('create method should return array of created todos if passed array of objects', async () => {
        const todoList = await todoListModelController.add({
            name: 'first',
        }) as NonNullable<Document & TodoListSchema>;

        const createdTodo = await service.create([{
            title: 'usr123',
            todoList: todoList._id,
        }, {
            title: 'usr456',
            todoList: todoList._id,
        }]);

        expect(createdTodo).toHaveLength(2);
    });

    test('get method should return todo data if todo exists', async () => {
        const todoList = await todoListModelController.add({
            name: 'first',
        }) as NonNullable<Document & TodoListSchema>;

        const createdTodo = await service.create({
            title: 'foo',
            todoList: todoList._id,
        }) as NonNullFromDB;

        const todo = await service.get({
            _id: createdTodo._id,
        });

        expect(todo).not.toBeNull();
    });

    test('get method should throw error if todo does not exist', async () => {
        const todoList = await todoListModelController.add({
            name: 'first',
        }) as NonNullable<Document & TodoListSchema>;

        await service.create({
            title: 'bar',
            todoList: todoList._id,
        }) as NonNullFromDB;

        expect(service.get({
            _id: '5e9e25a2bf2c866a5f05682f',
        }))
            .rejects
            .toEqual(new HttpErrors.NotFound('There is not todo with this id: 5e9e25a2bf2c866a5f05682f.'));
    });

    test('getMany method should return todos data if todos with current filter exist', async () => {
        const todoList = await todoListModelController.add({
            name: 'first',
        }) as NonNullable<Document & TodoListSchema>;

        await service.create([{
            title: '123',
            todoList: todoList._id,
        }, {
            title: '456',
            todoList: todoList._id,
        }]);

        expect(await service.getMany({
            title: {
                $in: ['123', '456'],
            },
        })).toHaveLength(2);
    });

    test('getMany method should throw error if there are not todos which fit to this filter', async () => {
        const todoList = await todoListModelController.add({
            name: 'first',
        }) as NonNullable<Document & TodoListSchema>;

        await service.create([{ title: 'getManyThrow', todoList: todoList._id }]);

        expect(service.getMany({
            title: 'getManyThrowww',
        }))
            .rejects
            .toEqual(new HttpErrors.NotFound(`There are not todos with this filter: ${
                { title: 'getManyThrowww' }
            }.`));
    });
});
