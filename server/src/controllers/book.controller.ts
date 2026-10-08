import { isValidObjectId } from 'mongoose';
import type { RequestHandler } from 'express';

import { AppError } from '../errors/app-error.js';
import { Book } from '../models/book.model.js';

type BookInput = {
  name?: string;
  author?: string;
  pageCount?: number;
};

function getBookInput(body: unknown, requireAtLeastOneField = false): BookInput {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new AppError('Request body must be a JSON object.', 422);
  }

  const input = body as Record<string, unknown>;
  const bookInput: BookInput = {};

  if ('name' in input) {
    if (typeof input.name !== 'string') {
      throw new AppError('Book name must be a string.', 422);
    }
    bookInput.name = input.name;
  }

  if ('author' in input) {
    if (typeof input.author !== 'string') {
      throw new AppError('Author must be a string.', 422);
    }
    bookInput.author = input.author;
  }

  if ('pageCount' in input) {
    if (typeof input.pageCount !== 'number') {
      throw new AppError('Page count must be a number.', 422);
    }
    bookInput.pageCount = input.pageCount;
  }

  if (requireAtLeastOneField && Object.keys(bookInput).length === 0) {
    throw new AppError('Provide at least one field to update.', 422);
  }

  return bookInput;
}

function getBookId(id: string | string[]): string {
  if (Array.isArray(id) || !isValidObjectId(id)) {
    throw new AppError('Book not found.', 404);
  }

  return id;
}

export const listBooks: RequestHandler = async (_request, response) => {
  const books = await Book.find().sort({ createdAt: -1 }).exec();
  response.status(200).json({ books });
};

export const getBookById: RequestHandler = async (request, response) => {
  const bookId = getBookId(request.params.id);

  const book = await Book.findById(bookId).exec();

  if (!book) {
    throw new AppError('Book not found.', 404);
  }

  response.status(200).json({ book });
};

export const createBook: RequestHandler = async (request, response) => {
  const book = await Book.create(getBookInput(request.body));
  response.status(201).json({ book });
};

export const updateBook: RequestHandler = async (request, response) => {
  const bookId = getBookId(request.params.id);

  const book = await Book.findByIdAndUpdate(bookId, getBookInput(request.body, true), {
    new: true,
    runValidators: true,
  }).exec();

  if (!book) {
    throw new AppError('Book not found.', 404);
  }

  response.status(200).json({ book });
};

export const deleteBook: RequestHandler = async (request, response) => {
  const bookId = getBookId(request.params.id);

  const book = await Book.findByIdAndDelete(bookId).exec();

  if (!book) {
    throw new AppError('Book not found.', 404);
  }

  response.status(204).send();
};
