import { beforeAll, afterAll, afterEach } from 'vitest';
import { connectDB, disconnectDB } from '../src/config/database';
import redisClient from '../src/config/redis';

beforeAll(async () => {
  await connectDB();
});

afterEach(async () => {
  
});

afterAll(async () => {
  await disconnectDB();
  await redisClient.quit();
});