/** External imports */
import mongoose from 'mongoose';

/** Application's imports */
import { TodoListSchema } from './types';
import { todoSchema } from '../todo/schema';

const Schema = mongoose.Schema;

export const todoListSchema = new Schema<TodoListSchema>({
    name: {
        type: 'string',
        required: true,
        default: 'Todo List',
    },
    todos: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Todo' }],
        default: [],
    },
}, {
    autoIndex: true,
    timestamps: true,
});
