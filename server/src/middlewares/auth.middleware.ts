import jwt from 'jsonwebtoken';
import type { RequestHandler } from 'express';

import { env } from '../config/env.js';
import { AppError } from '../errors/app-error.js';
import { type UserRole, USER_ROLES } from '../models/user.model.js';

type AuthTokenPayload = {
  userId: string;
  role: UserRole;
};

function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && USER_ROLES.includes(value as UserRole);
}

function getToken(authorizationHeader: string | undefined): string {
  if (!authorizationHeader) {
    throw new AppError('Authentication is required.', 401);
  }

  const [scheme, token, ...extraParts] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token || extraParts.length > 0) {
    throw new AppError('Authorization header must use the Bearer token scheme.', 401);
  }

  return token;
}

function verifyToken(token: string): AuthTokenPayload {
  try {
    const payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });

    if (
      typeof payload === 'string' ||
      typeof payload.userId !== 'string' ||
      !isUserRole(payload.role)
    ) {
      throw new AppError('Authentication token has an invalid payload.', 401);
    }

    return { userId: payload.userId, role: payload.role };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('Authentication token is invalid or expired.', 401);
  }
}

export const requireAuth: RequestHandler = (request, _response, next) => {
  try {
    const token = getToken(request.header('authorization'));
    request.auth = verifyToken(token);
    next();
  } catch (error) {
    next(error);
  }
};

export function requireRole(...allowedRoles: UserRole[]): RequestHandler {
  return (request, _response, next) => {
    if (!request.auth) {
      next(new AppError('Authentication is required.', 401));
      return;
    }

    if (!allowedRoles.includes(request.auth.role)) {
      next(new AppError('You do not have permission to access this resource.', 403));
      return;
    }

    next();
  };
}
