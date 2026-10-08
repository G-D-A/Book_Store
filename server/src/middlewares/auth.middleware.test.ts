import assert from 'node:assert/strict';
import test from 'node:test';

import jwt from 'jsonwebtoken';
import type { Request, RequestHandler } from 'express';

import { env } from '../config/env.js';
import { AppError } from '../errors/app-error.js';
import { requireAuth, requireRole } from './auth.middleware.js';

function runMiddleware(handler: RequestHandler, request: Partial<Request>): Promise<unknown> {
  return new Promise((resolve) => {
    handler(request as Request, {} as never, (error?: unknown) => resolve(error));
  });
}

function requestWithAuthorization(authorization?: string): Partial<Request> {
  return {
    header: ((name: string) =>
      name === 'authorization' ? authorization : undefined) as Request['header'],
  };
}

test('requireAuth adds the verified user to the request', async () => {
  const token = jwt.sign({ userId: 'user-id', role: 'user' }, env.jwtSecret, {
    algorithm: 'HS256',
  });
  const request = requestWithAuthorization(`Bearer ${token}`);

  const error = await runMiddleware(requireAuth, request);

  assert.equal(error, undefined);
  assert.deepEqual(request.auth, { userId: 'user-id', role: 'user' });
});

test('requireAuth rejects an invalid token', async () => {
  const error = await runMiddleware(requireAuth, requestWithAuthorization('Bearer invalid-token'));

  assert.ok(error instanceof AppError);
  assert.equal(error.statusCode, 401);
});

test('requireRole allows only the requested role', async () => {
  const userRequest = { auth: { userId: 'user-id', role: 'user' as const } };
  const adminRequest = { auth: { userId: 'admin-id', role: 'admin' as const } };

  const deniedError = await runMiddleware(requireRole('admin'), userRequest);
  const grantedError = await runMiddleware(requireRole('admin'), adminRequest);

  assert.ok(deniedError instanceof AppError);
  assert.equal(deniedError.statusCode, 403);
  assert.equal(grantedError, undefined);
});
