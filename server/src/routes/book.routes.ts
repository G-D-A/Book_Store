import { Router } from 'express';

import {
  createBook,
  deleteBook,
  getBookById,
  listBooks,
  updateBook,
} from '../controllers/book.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

export const bookRouter = Router();

bookRouter
  .route('/books')
  .get(requireAuth, asyncHandler(listBooks))
  .post(requireAuth, requireRole('admin'), asyncHandler(createBook));

bookRouter
  .route('/books/:id')
  .get(requireAuth, asyncHandler(getBookById))
  .patch(requireAuth, requireRole('admin'), asyncHandler(updateBook))
  .delete(requireAuth, requireRole('admin'), asyncHandler(deleteBook));
