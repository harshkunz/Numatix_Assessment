import { prisma } from '../config/db';
import { Order } from '../types/order';

export const OrderCommandRepo = {
  create(order: Order) {
    return prisma.orderCommand.create({
      data: {
        orderId: order.orderId,
        userId: order.userId,
        symbol: order.symbol,
        side: order.side,
        type: order.type,
        quantity: order.quantity,
        status: 'PENDING',
      },
    });
  },
  getUser(userId: number) {
    return prisma.user.findUnique({ where: { id: userId } });
  },
};
