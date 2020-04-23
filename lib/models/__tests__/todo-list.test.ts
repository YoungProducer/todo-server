/** External imports */
import mongoose, { Model, Document } from 'mongoose';

/** Application's imports */
import { todoListSchema } from '../todo-list/schema';
import { todoSchema } from '../todo/schema';
import { TodoListSchema, TodoListModelController, TodoListModel } from '../todo-list';
import { TodoModelController, TodoSchema } from '../todo';

type NonNullFromDB = NonNullable<TodoListModel.FromDBPopulated>;

describe('Todo list model controller', () => {
    const model: Model<Document & TodoListSchema> = mongoose.model('TodoList', todoListSchema);
    const todoModel: Model<Document & TodoSchema> = mongoose.model('Todo', todoSchema);
    const modelController = new TodoListModelController();
    const todoController = new TodoModelController();

    beforeAll(async () => {
        mongoose.set('useFindAndModify', true);
        await mongoose.connect('mongodb+srv://WithoutHands:Sasha080701@mycluster-qntjt.azure.mongodb.net/todo-dashboard-test?retryWrites=true&w=majority', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    afterEach(async () => {
        await model.deleteMany({});
        await todoController.removeMany({});
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
});
