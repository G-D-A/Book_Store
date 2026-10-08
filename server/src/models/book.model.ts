import { InferSchemaType, model, Schema } from 'mongoose';

const bookSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Book name is required.'],
      trim: true,
      minlength: [1, 'Book name cannot be empty.'],
      maxlength: [200, 'Book name must not exceed 200 characters.'],
    },
    author: {
      type: String,
      required: [true, 'Author is required.'],
      trim: true,
      minlength: [1, 'Author cannot be empty.'],
      maxlength: [100, 'Author must not exceed 100 characters.'],
    },
    pageCount: {
      type: Number,
      required: [true, 'Page count is required.'],
      min: [1, 'Page count must be at least 1.'],
      validate: {
        validator: Number.isInteger,
        message: 'Page count must be a whole number.',
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type BookDocument = InferSchemaType<typeof bookSchema>;
export const Book = model<BookDocument>('Book', bookSchema);
