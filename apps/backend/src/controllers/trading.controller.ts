import type { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/db';
import { publishOrderCommand } from '../services/redisPublisher.service';

export const placeOrder = async (req: Request, res: Response) => {
  try {
    const { symbol, side, type, quantity } = req.body;

    if (type !== 'MARKET') {
      return res.status(400).json({
        error: 'Only MARKET orders are supported',
      });
    }
    
    if (!symbol || !side || !type || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;
    const orderId = uuidv4();

    const orderCommand = {
      orderId,
      userId,
      symbol,
      side,       // "BUY" | "SELL"
      type,       // "MARKET" | "LIMIT" | ...
      quantity,
      status: 'PENDING' as const,
    };

    await publishOrderCommand(
      'commands:order:submit',
      JSON.stringify(orderCommand),
    );

    return res.json({ orderId, status: 'PENDING' });
  } catch (err) {
    console.error('placeOrder error', err);
    return res.status(500).json({ error: 'Failed to place order' });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;

    const orders = await prisma.orderCommand.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(orders);
  } catch (err) {
    console.error('getOrders error', err);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getTrades = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const events = await prisma.orderEvent.findMany({
    where: { userId, status: 'FILLED' },
    orderBy: { createdAt: 'desc' },
  });

  const orderIds = events.map((e) => e.orderId);

  const commands = await prisma.orderCommand.findMany({
    where: { orderId: { in: orderIds } },
  });
  const commandMap = new Map(commands.map((c) => [c.orderId, c]));

  const rows = events.map((e) => {
    const cmd = commandMap.get(e.orderId);
    return {
      id: e.id,
      orderId: e.orderId,
      userId: e.userId,
      quantity: e.quantity,
      price: e.price,
      createdAt: e.createdAt,
      symbol: cmd?.symbol ?? null,
      side: cmd?.side ?? null,
      timestamp: e.timestamp,
      status: e.status,
    };
  });
  res.json(rows);
};

export const getPositions = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;

    const events = await prisma.orderEvent.findMany({
      where: { userId, status: 'FILLED' },
      orderBy: { createdAt: 'asc' },
    });

    const orderIds = events.map((e) => e.orderId);
    const commands = await prisma.orderCommand.findMany({
    where: { orderId: { in: orderIds } },
  });
  const commandMap = new Map(commands.map((c) => [c.orderId, c]));

    type Pos = { 
      netQty: number; 
      avgPrice: number; 
      realizedPnL: number; 
    };

    const positions: Record<string, Pos> = {};

    events.forEach((orderRaw) => {
      const order = orderRaw as any;
      const command = commandMap.get(order.orderId);
      if (!command) return;

      const symbol = command.symbol;
      const side = command.side as 'BUY' | 'SELL';
      const price = Number(order.price);
      const qty = Number(order.quantity);

      if (!positions[symbol]) {
        positions[symbol] = { netQty: 0, avgPrice: 0, realizedPnL: 0 };
      }

      const pos = positions[symbol];
      
      // Check
      if (side === 'BUY') {
        if (pos.netQty >= 0) {
          // Increasing Long position
          const totalCost = pos.netQty * pos.avgPrice + qty * price;
          pos.netQty += qty;
          pos.avgPrice = totalCost / pos.netQty;
        } else {
          // Closing Short position
          const remaining = pos.netQty + qty;
          if (remaining <= 0) {
            // Fully or partially closing short
            pos.realizedPnL += (pos.avgPrice - price) * qty;
            pos.netQty = remaining;
          } else {
            // Closed short and flipped to long
            const qtyToClose = Math.abs(pos.netQty);
            const qtyToOpen = remaining;
            pos.realizedPnL += (pos.avgPrice - price) * qtyToClose;
            pos.netQty = qtyToOpen;
            pos.avgPrice = price;
          }
        }
      } 
      else {
        // SELL
        if (pos.netQty <= 0) {
          // Increasing Short position
          const totalCost = Math.abs(pos.netQty) * pos.avgPrice + qty * price;
          pos.netQty -= qty;
          pos.avgPrice = totalCost / Math.abs(pos.netQty);
        } else {
          // Closing Long position
          const remaining = pos.netQty - qty;
          if (remaining >= 0) {
            // Fully or partially closing long
            pos.realizedPnL += (price - pos.avgPrice) * qty;
            pos.netQty = remaining;
          } else {
            // Closed long and flipped to short
            const qtyToClose = pos.netQty;
            const qtyToOpen = Math.abs(remaining);
            pos.realizedPnL += (price - pos.avgPrice) * qtyToClose;
            pos.netQty = -qtyToOpen;
            pos.avgPrice = price;
          }
        }
      }
    });

    const rows = Object.entries(positions).map(([symbol, pos]) => {
      const marketPrice = 0; // Live Update
      const unrealizedPnL = (marketPrice - pos.avgPrice) * pos.netQty;
      const side =
        pos.netQty > 0 ? 'BUY'
        : pos.netQty < 0 ? 'SELL'
        : 'FLAT';
      
      return {
        symbol,
        side,
        size: Number(pos.netQty.toFixed(3)),
        entryPrice: Number(pos.avgPrice.toFixed(2)),
        marketPrice,
        realizedPnL: Number(pos.realizedPnL.toFixed(2)),
        unrealizedPnL: Number(unrealizedPnL.toFixed(2)),
      };
    });

    return res.json(rows);
  } catch (err) {
    console.error('getPositions error', err);
    return res.status(500).json({ error: 'Failed to fetch positions' });
  }
};
