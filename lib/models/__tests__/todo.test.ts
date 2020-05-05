/** External imports */
import mongoose, { Model, Document } from 'mongoose';

/** Application's imports */
import { TodoModelController, TodoSchema, TodoModel } from '../todo';
import { TodoListModelController, TodoListSchema } from '../todo-list';
import { todoSchema } from '../todo/schema';

type NonNullFromDB = Document & TodoSchema;

describe('TodoModelController', () => {
    const model: Model<Document & TodoSchema> = mongoose.model('Todo', todoSchema);
    const modelController = new TodoModelController();
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

    test('Create todo', async () => {
        const todoList = await todoListModelController.add({
            name: 'test',
        }) as NonNullable<Document & TodoListSchema>;

        await modelController.add({
            title: 'foo',
            todoList: todoList._id,
        });

        const foundTodo = await model.findOne({
            title: 'foo',
        });

        expect(foundTodo).not.toBeNull();
    });

    test('Create many todos', async () => {
        const todoList = await todoListModelController.add({
            name: 'test',
        }) as NonNullable<Document & TodoListSchema>;

        await modelController.add([{
            title: 'foo123',
            todoList: todoList._id,
        }, {
            title: 'bar123',
            todoList: todoList._id,
        }]);

        const foundTodos = await model.find({
            title: {
                $in: ['foo123', 'bar123'],
            },
        });

        expect(foundTodos).toHaveLength(2);
    });

    test('Read todo', async () => {
        const todoList = await todoListModelController.add({
            name: 'test',
        }) as NonNullable<Document & TodoListSchema>;

        const newTodo = await modelController.add({
            title: 'bar',
            todoList: todoList._id,
        }) as NonNullFromDB;

        const readTodo = await modelController.get(newTodo._id);

        expect(readTodo).not.toBeNull();
    });

    test('Read many', async () => {
        const todoList = await todoListModelController.add({
            name: 'test',
        }) as NonNullable<Document & TodoListSchema>;

        await modelController.add({ title: 'foo', todoList: todoList._id });
        await modelController.add({ title: 'bar', todoList: todoList._id });

        const todos = await modelController.getMany({
            title: {
                $in: ['foo', 'bar'],
            },
        });

        expect(todos.length).toBe(2);
    });

    test('Remove many', async () => {
        const todoList = await todoListModelController.add({
            name: 'test',
        }) as NonNullable<Document & TodoListSchema>;

        await modelController.add({ title: 'hello', todoList: todoList._id });
        await modelController.add({ title: 'world', todoList: todoList._id });

        const rmData = await modelController.removeMany({
            title: {
                $in: ['hello', 'world'],
            },
        });

        expect(rmData.deletedCount).toBe(2);
    });

    test('Update todo', async () => {
        const todoList = await todoListModelController.add({
            name: 'test',
        }) as NonNullable<Document & TodoListSchema>;

        const todo = await modelController.add({ title: 'baz', todoList: todoList._id }) as NonNullFromDB;

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
