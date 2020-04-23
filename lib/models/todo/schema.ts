/** External imports */
import mongoose from 'mongoose';

/** Application's imports */
import { TodoSchema } from './types';

const Schema = mongoose.Schema;

export const todoSchema = new Schema<TodoSchema>({
    title: {
        type: 'string',
        required: true,
    },
    todoList: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'TodoList',
    },
}, {
    autoIndex: true,
    timestamps: true,
});
