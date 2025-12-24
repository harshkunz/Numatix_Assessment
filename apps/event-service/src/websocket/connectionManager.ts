import { WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { verifyJWT } from '../config/jwt';
import { logger } from '../utils/logger';

class ConnectionManager {
  private connections = new Map<string, WebSocket>();
  
  handleConnection(ws: WebSocket, req: IncomingMessage) {
    try {
      const url = new URL(req.url ?? '', `http://${req.headers.host}`);
      const token = url.searchParams.get('token');
      logger.log(`WS TOKEN SERVER ${token}`);

      if (!token) {
        logger.log('Token missing, closing WS');
        ws.close();
        return;
      }

      const decoded: any = verifyJWT(token);
      const userId = String(decoded.id);

      this.connections.set(userId, ws);
      logger.log(`User ${userId} connected`);

      ws.on('close', () => {
        this.connections.delete(userId);
        logger.log(`User ${userId} disconnected`);
      });
    } catch (err) {
      logger.log(`WS AUTH ERROR ${(err as Error).message}`);
      ws.close();
    }
  }

  broadcastToUser(userId: string | number, message: string) {
    const key = String(userId);
    const ws = this.connections.get(key);
    logger.log(`LOOKUP WS FOR ${key} FOUND: ${!!ws}`);

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }
}

export const connectionManager = new ConnectionManager();
