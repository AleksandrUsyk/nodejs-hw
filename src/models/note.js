import { Schema, model } from 'mongoose';

const noteSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, default: '', trim: true },
    tag: {
      type: String,
      enum: [
        'Work',
        'Personal',
        'Meeting',
        'Shopping',
        'Ideas',
        'Travel',
        'Finance',
        'Health',
        'Important',
        'Todo',
      ],
      default: 'Todo',
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

export const Note = model('Note', noteSchema);
