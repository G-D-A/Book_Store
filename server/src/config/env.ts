import 'dotenv/config';

const port = Number(process.env.PORT ?? 4000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid port number.');
}

const mongoUri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;

if (!mongoUri) {
  throw new Error(
    'MONGODB_URI is required. Copy server/.env.example to server/.env and add your MongoDB Atlas connection string.',
  );
}

if (!jwtSecret || jwtSecret === 'replace-with-a-long-random-secret') {
  throw new Error(
    'JWT_SECRET is required. Set it to a long random value in server/.env before starting the server.',
  );
}

export const env = {
  port,
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  mongoUri,
  jwtSecret,
};
