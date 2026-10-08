import { isValidObjectId } from 'mongoose';
import type { RequestHandler } from 'express';

import { AppError } from '../errors/app-error.js';
import { type UserRole, USER_ROLES, User } from '../models/user.model.js';
import { hashPassword } from '../utils/password.js';
import { serializeUser } from '../utils/public-user.js';

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

type UpdateUserInput = Partial<CreateUserInput>;

function getObject(body: unknown): Record<string, unknown> {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new AppError('Request body must be a JSON object.', 422);
  }

  return body as Record<string, unknown>;
}

function getRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new AppError(`${fieldName} is required.`, 422);
  }

  return value;
}

function getRole(value: unknown): UserRole {
  if (typeof value !== 'string' || !USER_ROLES.includes(value as UserRole)) {
    throw new AppError('Role must be either user or admin.', 422);
  }

  return value as UserRole;
}

function getCreateUserInput(body: unknown): CreateUserInput {
  const input = getObject(body);
  const password = getRequiredString(input.password, 'Password');

  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters long.', 422);
  }

  return {
    name: getRequiredString(input.name, 'Name').trim(),
    email: getRequiredString(input.email, 'Email').trim(),
    password,
    role: input.role === undefined ? 'user' : getRole(input.role),
  };
}

function getUpdateUserInput(body: unknown): UpdateUserInput {
  const input = getObject(body);
  const update: UpdateUserInput = {};

  if ('name' in input) {
    update.name = getRequiredString(input.name, 'Name').trim();
  }

  if ('email' in input) {
    update.email = getRequiredString(input.email, 'Email').trim();
  }

  if ('password' in input) {
    const password = getRequiredString(input.password, 'Password');
    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters long.', 422);
    }
    update.password = password;
  }

  if ('role' in input) {
    update.role = getRole(input.role);
  }

  if (Object.keys(update).length === 0) {
    throw new AppError('Provide at least one field to update.', 422);
  }

  return update;
}

function getUserId(id: string | string[]): string {
  if (Array.isArray(id) || !isValidObjectId(id)) {
    throw new AppError('User not found.', 404);
  }

  return id;
}

async function getUserOrThrow(id: string): Promise<InstanceType<typeof User>> {
  const user = await User.findById(id).exec();

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return user;
}

async function assertAdminCanBeRemovedOrDemoted(user: { role: string }): Promise<void> {
  if (user.role !== 'admin') {
    return;
  }

  const adminCount = await User.countDocuments({ role: 'admin' });

  if (adminCount <= 1) {
    throw new AppError('The last administrator cannot be removed or demoted.', 409);
  }
}

export const listUsers: RequestHandler = async (_request, response) => {
  const users = await User.find().sort({ createdAt: -1 }).exec();
  response.status(200).json({ users: users.map(serializeUser) });
};

export const getUserById: RequestHandler = async (request, response) => {
  const user = await getUserOrThrow(getUserId(request.params.id));
  response.status(200).json({ user: serializeUser(user) });
};

export const createUser: RequestHandler = async (request, response) => {
  const input = getCreateUserInput(request.body);
  const user = await User.create({ ...input, password: await hashPassword(input.password) });

  response.status(201).json({ user: serializeUser(user) });
};

export const updateUser: RequestHandler = async (request, response) => {
  const user = await getUserOrThrow(getUserId(request.params.id));
  const update = getUpdateUserInput(request.body);

  if (update.role && update.role !== user.role) {
    if (request.auth?.userId === user.id) {
      throw new AppError('You cannot change your own role.', 403);
    }

    if (user.role === 'admin' && update.role !== 'admin') {
      await assertAdminCanBeRemovedOrDemoted(user);
    }
  }

  if (update.name !== undefined) user.name = update.name;
  if (update.email !== undefined) user.email = update.email;
  if (update.role !== undefined) user.role = update.role;
  if (update.password !== undefined) user.password = await hashPassword(update.password);

  await user.save();
  response.status(200).json({ user: serializeUser(user) });
};

export const deleteUser: RequestHandler = async (request, response) => {
  const user = await getUserOrThrow(getUserId(request.params.id));

  if (request.auth?.userId === user.id) {
    throw new AppError('You cannot delete your own account.', 403);
  }

  await assertAdminCanBeRemovedOrDemoted(user);
  await user.deleteOne();

  response.status(204).send();
};
