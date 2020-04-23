/** External imports */
import mongoose, { Model, Document } from 'mongoose';

/** Application's imports */
import { todoListSchema } from '../todo-list/schema';
import { todoSchema } from '../todo/schema';
import { TodoListSchema, TodoListModelController, TodoListModel } from '../todo-list';
import { TodoModelController, TodoSchema } from '../todo';

type NonNullFromDB = NonNullable<TodoListModel.FromDBPopulated>;

describe('Todo list model controller', () => {
    /** Main model in this tests (TodoList) */
    const model: Model<Document & TodoListSchema> = mongoose.model('TodoList', todoListSchema);
    const todoModel: Model<Document & TodoSchema> = mongoose.model('Todo', todoSchema);
    /** Main controller in this tests (TodoList) */
    const modelController = new TodoListModelController();
    const todoModelController = new TodoModelController();

    beforeAll(async () => {
        mongoose.set('useFindAndModify', true);
        await mongoose.connect('mongodb+srv://WithoutHands:Sasha080701@mycluster-qntjt.azure.mongodb.net/todo-dashboard-test?retryWrites=true&w=majority', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    afterEach(async () => {
        await model.deleteMany({});
        await todoModel.deleteMany({});
    });

    afterAll(async () => {
        mongoose.disconnect();
    });

    test(`add method without todos' titles in payload should create empty todo list`, async () => {
        const todoList = await modelController.add({
            name: 'todos',
        }) as TodoListSchema;

        expect(todoList.todos).toHaveLength(0);
    });

    test(`add method with todos' titles in payload should return object with array of objects ids`, async () => {
        const todoList = await modelController.add({
            name: 'todos',
            todos: ['first'],
        }) as TodoListSchema;

        expect(todoList.todos).toHaveLength(1);
    });

    test(`get should return todo list with populated todos if _id is valid`, async () => {
        const newTodoList = await modelController.add({
            name: 'todos',
            todos: ['first'],
        }) as TodoListSchema;

        const todoList = await modelController.get(newTodoList._id) as NonNullFromDB;

        expect(todoList).not.toBeNull();
        expect(todoList.todos).toHaveLength(1);
    });

    test(`get should return null if _id is valid`, async () => {
        const todoList = await modelController.get('5ea1e5aa57c7e974a9828205');

        expect(todoList).toBeNull();
    });

    test(`getMany should return all todo lists if filter not provided`, async () => {
        await modelController.add({
            name: 'todos123',
            todos: ['first'],
        }) as TodoListSchema;
        await modelController.add({
            name: 'todos456',
            todos: ['second'],
        }) as TodoListSchema;

        const todoLists = await modelController.getMany({}) as NonNullFromDB[];

        expect(todoLists).toHaveLength(2);
        /** Assert that todos are populated */
        expect(todoLists[0].todos[0]).toHaveProperty('_id');
    });

    test(`getMany should return array of todo lists if filter is valid`, async () => {
        await modelController.add({
            name: 'todos123',
            todos: ['first'],
        }) as TodoListSchema;
        await modelController.add({
            name: 'todos456',
            todos: ['second'],
        }) as TodoListSchema;

        const todoLists = await modelController.getMany({
            name: 'todos123',
        }) as NonNullFromDB[];

        expect(todoLists).toHaveLength(1);
        /** Assert that todos are populated */
        expect(todoLists[0].todos[0]).toHaveProperty('_id');
    });

    test(`getMany should return empty array if filter is invalid`, async () => {
        const todoLists = await modelController.getMany({
            name: 'todos123',
        }) as NonNullFromDB[];

        expect(todoLists).toHaveLength(0);
    });

    test(`delete should return amount of deleted todo lists`, async () => {
        const todoList = await modelController.add({
            name: 'list',
        }) as NonNullFromDB;

        const rmData = await modelController.delete(todoList._id);

        expect(rmData.deletedCount).toBe(1);
    });

    test(`delete should also delete all todos related to this todo list`, async () => {
        const todoList = await modelController.add({
            name: 'list',
            todos: ['hello'],
        }) as NonNullFromDB;

        const rmData = await modelController.delete(todoList._id);

        const deletedTodos = await todoModelController.getMany({
            title: 'hello',
        });

        expect(rmData.deletedCount).toBe(1);
        expect(deletedTodos).toHaveLength(0);
    });
});
