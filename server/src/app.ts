import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { authRouter } from './routes/auth.routes.js';
import { bookRouter } from './routes/book.routes.js';
import { userRouter } from './routes/user.routes.js';

export const app = express();

app.use(
  cors({
    origin: env.clientOrigin,
  }),
);
app.use(express.json());

app.get('/health', (_request, response) => {
  const isDatabaseConnected = mongoose.connection.readyState === 1;

  response.status(isDatabaseConnected ? 200 : 503).json({
    status: isDatabaseConnected ? 'ok' : 'unavailable',
    database: isDatabaseConnected ? 'connected' : 'disconnected',
  });
});

app.use(authRouter);
app.use(bookRouter);
app.use(userRouter);
app.use(notFoundHandler);
app.use(errorHandler);
