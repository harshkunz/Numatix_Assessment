import { Order } from '../types/order';
import { OrderService } from '../services/order.service';
import { OrderCommandRepo } from '../repositories/orderCommand.repo';
import { OrderEventRepo } from '../repositories/orderEvent.repo';
import { redisPublisher } from '../config/redis';

export const orderConsumer = async (order: Order) => {
  //console.log('orderConsumer received command', order);
  const service = new OrderService();
  await OrderCommandRepo.create(order);

  try {
    const event = await service.executeOrder(order);
    await OrderEventRepo.create({
      orderId: event.orderId,
      userId: event.userId,
      status: event.status,
      symbol: event.symbol,
      side: event.side,
      price: event.price,
      quantity: event.quantity,
      timestamp: new Date(event.timestamp),
      createdAt: new Date(),
    });

    await redisPublisher.publish(
      'events:order:status',
      JSON.stringify({
        orderId: event.orderId,
        userId: event.userId,
        status: event.status,
        symbol: event.symbol,
        side: event.side,
        quantity: event.quantity,
        price: event.price,
        timestamp: event.timestamp,
      })
    );

    //console.log('orderConsumer success', event);
  } catch (err: any) {
    console.error('orderConsumer caught error', err);

    const failedEvent = {
      orderId: order.orderId,
      userId: order.userId,
      status: 'REJECTED' as const,
      symbol: order.symbol,
      side: order.side,
      quantity: order.quantity,
      price: 0,
      timestamp: new Date().toISOString(),
    };

    try {
      await OrderEventRepo.create({
        ...failedEvent,
        createdAt: new Date(),
      });
    } catch (dbErr) {
      console.error('Failed to persist failedEvent', dbErr);
    }

    await redisPublisher.publish(
      'events:order:status',
      JSON.stringify(failedEvent)
    );
  }
};
