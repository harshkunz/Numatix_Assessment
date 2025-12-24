import { redis } from '../config/redis';

export const publishOrderCommand = async (channel: string, message: string) => {
  try {
    const receivers = await redis.publish(channel, message);
    return receivers;
  }
  
  catch (err) {
    console.error('Redis publish Failed', err);
    throw err;
  }
};