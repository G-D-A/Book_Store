import mongoose from 'mongoose';

import { env } from './env.js';

mongoose.set('bufferCommands', false);

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.mongoUri);
    console.info('Connected to MongoDB.');
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown database error.';

    throw new Error(`Unable to connect to MongoDB. Check MONGODB_URI and Atlas network access. ${details}`);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
