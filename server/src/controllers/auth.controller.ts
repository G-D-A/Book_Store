import jwt from 'jsonwebtoken';
import type { RequestHandler } from 'express';

import { env } from '../config/env.js';
import { AppError } from '../errors/app-error.js';
import { type UserRole, User } from '../models/user.model.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { serializeUser } from '../utils/public-user.js';

const TOKEN_EXPIRATION = '1h';

type SignupInput = {
  name: string;
  email: string;
  password: string;
};

type LoginInput = Omit<SignupInput, 'name'>;

function requireString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new AppError(`${fieldName} is required.`, 422);
  }

  return value;
}

function getSignupInput(body: unknown): SignupInput {
  if (typeof body !== 'object' || body === null) {
    throw new AppError('Request body must be a JSON object.', 422);
  }

  const input = body as Record<string, unknown>;
  const password = requireString(input.password, 'Password');

  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters long.', 422);
  }

  return {
    name: requireString(input.name, 'Name').trim(),
    email: requireString(input.email, 'Email').trim(),
    password,
  };
}

function getLoginInput(body: unknown): LoginInput {
  if (typeof body !== 'object' || body === null) {
    throw new AppError('Request body must be a JSON object.', 422);
  }

  const input = body as Record<string, unknown>;
  const password = requireString(input.password, 'Password');

  return {
    email: requireString(input.email, 'Email').trim(),
    password,
  };
}

function createToken(userId: string, role: UserRole): string {
  return jwt.sign({ userId, role }, env.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: TOKEN_EXPIRATION,
  });
}

export const signup: RequestHandler = async (request, response) => {
  const { name, email, password } = getSignupInput(request.body);
  const passwordHash = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    password: passwordHash,
    role: 'user',
  });

  response.status(201).json({
    user: serializeUser(user),
    token: createToken(user.id, user.role as UserRole),
  });
};

export const login: RequestHandler = async (request, response) => {
  const { email, password } = getLoginInput(request.body);
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password').exec();

  if (!user || !(await verifyPassword(password, user.password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  response.status(200).json({
    user: serializeUser(user),
    token: createToken(user.id, user.role as UserRole),
  });
};
