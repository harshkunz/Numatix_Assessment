import { WebSocketServer, WebSocket } from 'ws';
import ENV from './config/env';
import { connectionManager } from './websocket/connectionManager';
import { orderEventsSubscriber } from './subscribers/orderEvents.subscriber';
import { accountEventsSubscriber } from './subscribers/accountEvents.subscriber';
import { logger } from './utils/logger';

export const heartbeat = (ws: WebSocket) => {
  ws.on('pong', () => {
    logger.log('Pong received');
  });

  setInterval(() => {
    ws.ping();
  }, 30000);
};

export function startServer() {
  const wss = new WebSocketServer({
    port: Number(ENV.PORT),
    path: '/prices',        // <-- ws://host:PORT/prices
  });

  wss.on('connection', (ws, req) => {
    connectionManager.handleConnection(ws, req);
    heartbeat(ws);
  });

  orderEventsSubscriber();
  accountEventsSubscriber();

  console.log('Event Service running...');
  console.log(`WebSocket endpoint ws://localhost:${ENV.PORT}/prices`);
}
