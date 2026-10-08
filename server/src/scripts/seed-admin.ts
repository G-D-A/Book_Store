import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { User } from '../models/user.model.js';
import { hashPassword } from '../utils/password.js';

function requiredEnvironmentValue(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required to seed the first administrator.`);
  }

  return value;
}

async function seedAdmin(): Promise<void> {
  const name = requiredEnvironmentValue('ADMIN_NAME');
  const email = requiredEnvironmentValue('ADMIN_EMAIL').toLowerCase();
  const password = requiredEnvironmentValue('ADMIN_PASSWORD');

  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters long.');
  }

  await connectDatabase();

  try {
    const existingUser = await User.findOne({ email }).exec();

    if (existingUser) {
      if (existingUser.role !== 'admin') {
        throw new Error('ADMIN_EMAIL already belongs to a non-admin user. Choose another email.');
      }

      console.info('Administrator already exists.');
      return;
    }

    await User.create({
      name,
      email,
      password: await hashPassword(password),
      role: 'admin',
    });

    console.info('Administrator created.');
  } finally {
    await disconnectDatabase();
  }
}

seedAdmin().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown seed error.';
  console.error(`Failed to seed administrator: ${message}`);
  process.exitCode = 1;
});
