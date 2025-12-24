import Redis from 'ioredis';
import ENV from '../config/env';

export const redisSubscriber = new Redis(ENV.REDIS_URL);
export const redisPublisher = new Redis(ENV.REDIS_URL);