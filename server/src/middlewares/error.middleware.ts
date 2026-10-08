import type { ErrorRequestHandler, RequestHandler } from 'express';

import { AppError } from '../errors/app-error.js';

type MongoDuplicateKeyError = {
  code?: number;
  keyValue?: Record<string, unknown>;
};

export const notFoundHandler: RequestHandler = (request, _response, next) => {
  next(new AppError(`Route ${request.method} ${request.path} was not found.`, 404));
};

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({ message: error.message });
    return;
  }

  if (error instanceof Error && error.name === 'ValidationError') {
    response.status(422).json({ message: 'Validation failed.' });
    return;
  }

  const mongoError = error as MongoDuplicateKeyError;

  if (mongoError.code === 11000) {
    response.status(409).json({
      message: `A record with this ${Object.keys(mongoError.keyValue ?? {})[0] ?? 'value'} already exists.`,
    });
    return;
  }

  console.error(error);
  response.status(500).json({ message: 'Internal server error.' });
};
