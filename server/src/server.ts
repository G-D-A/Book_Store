import { app } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

async function startServer(): Promise<void> {
  await connectDatabase();

  const server = app.listen(env.port, () => {
    console.info(`Server is running at http://localhost:${env.port}`);
  });

  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    console.info(`${signal} received. Shutting down gracefully.`);

    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

startServer().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown startup error.';
  console.error(`Failed to start server: ${message}`);
  process.exitCode = 1;
});
