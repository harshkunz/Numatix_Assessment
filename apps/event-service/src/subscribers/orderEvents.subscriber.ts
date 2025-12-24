import { redisSubscriber } from '../config/redis';
import { connectionManager } from '../websocket/connectionManager';
import { logger } from '../utils/logger';

export const orderEventsSubscriber = () => {
  redisSubscriber.subscribe('events:order:status', (err) => {
    if (err) {
      logger.log('Failed to subscribe to events:order:status');
    } else {
      logger.log('Subscribed to events:order:status');
    }
  });

  redisSubscriber.on('message', (channel, message) => {
    if (channel !== 'events:order:status') return;
    
    const event = JSON.parse(message); 
    // { orderId, userId, status, symbol, side, quantity, price, timestamp }

    const payload = JSON.stringify({
      type: 'ORDER_UPDATE',
      data: {
        orderId: event.orderId,
        status: event.status,
        symbol: event.symbol,
        price: event.price,
        quantity: event.quantity,
        timestamp: event.timestamp,
      },
    });

    console.log('WS ORDER_UPDATE payload', payload);

    connectionManager.broadcastToUser(event.userId, payload);
    logger.log(`ORDER_UPDATE sent to user ${event.userId}`);
  });
};
