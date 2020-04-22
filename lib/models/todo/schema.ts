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
}, {
    autoIndex: true,
    timestamps: true,
});
