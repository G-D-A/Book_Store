import { Router } from 'express';

import {
  createUser,
  deleteUser,
  getUserById,
  listUsers,
  updateUser,
} from '../controllers/user.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

export const userRouter = Router();

userRouter.use(requireAuth, requireRole('admin'));

userRouter
  .route('/users')
  .get(asyncHandler(listUsers))
  .post(asyncHandler(createUser));

userRouter
  .route('/users/:id')
  .get(asyncHandler(getUserById))
  .patch(asyncHandler(updateUser))
  .delete(asyncHandler(deleteUser));
