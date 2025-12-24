import { redisSubscriber } from '../config/redis';
import { connectionManager } from '../websocket/connectionManager';
import { logger } from '../utils/logger';

export const accountEventsSubscriber = () => {
  redisSubscriber.subscribe('events:account:update', (err) => {
    if (err) {
       logger.log('Failed to subscribe to account update channel');
     } else {
       logger.log('Subscribed to events:account:update');
    }
  });
   redisSubscriber.on('message', (channel, message) => {
    if (channel !== 'events:account:update') return;

    logger.log(`REDIS MESSAGE ${channel} ${message}`);
    const evt = JSON.parse(message);

   const payload = JSON.stringify({
      type: 'ACCOUNT_UPDATE',
      data: {
        marginRatio: evt.marginRatio,
        maintenanceMargin: evt.maintenanceMargin,
        marginBalance: evt.marginBalance,
      },
     });

    connectionManager.broadcastToUser(evt.userId, payload);
    logger.log(`ACCOUNT_UPDATE sent to user ${evt.userId}`);
  });
};
