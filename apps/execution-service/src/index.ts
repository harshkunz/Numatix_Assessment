import { redisSubscriber } from './config/redis';
import { orderConsumer } from './consumers/order.consumer';


redisSubscriber.subscribe('commands:order:submit', (err, count) => {
  if (err) {
    console.error('Failed to subscribe to Redis channel:', err);
    return;
  }
  console.log('Execution service running...');
  console.log(`Subscribed to ${count} channel(s).`);
});


redisSubscriber.on('message', async (channel, message) => {
  if (channel !== 'commands:order:submit') return;
  console.log('GOT COMMAND:', message);
  try {
    const parsed = JSON.parse(message);
    await orderConsumer(parsed);
    console.log('ORDER PROCESSED OK');
  } catch (e) {
    console.error('ORDER CONSUMER ERROR', e);
  }
});
