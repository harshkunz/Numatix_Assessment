import { Order } from '../types/order';
import { OrderCommandRepo } from '../repositories/orderCommand.repo';
import { createBinanceClient } from '../services/binance.service';
import { decrypt } from '../utils/crypto';

export class OrderService {
  async executeOrder(order: Order) {
    const user = await OrderCommandRepo.getUser(order.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const binanceClient = createBinanceClient(
      decrypt(user.binanceApiKey),
      decrypt(user.binanceSecretKey)
    );

    try {
      const response = await binanceClient.newOrder(
        order.symbol,
        order.side,
        order.type,
        { quantity: order.quantity }
      );

      const data = response.data;
      //console.log('BINANCE ORDER RESPONSE', data);

      const avgPriceStr =
        (data.avgPrice && data.avgPrice !== '0') ? data.avgPrice : null;

      const fillsPriceStr =
        data.fills && data.fills.length > 0 && data.fills[0].price
          ? data.fills[0].price
          : null;

      const priceStr =
        avgPriceStr ??
        fillsPriceStr ??
        (data.price && data.price !== '0' ? data.price : '0');

      const executedQtyStr =
        data.executedQty ??
        (data.fills && data.fills.length > 0 && data.fills[0].qty) ??
        String(order.quantity);

      const event = {
        orderId: order.orderId,
        userId: order.userId,
        status: data.status as
          | 'FILLED'
          | 'REJECTED'
          | 'PARTIALLY_FILLED',
        symbol: order.symbol,
        side: order.side,
        quantity: parseFloat(executedQtyStr),
        price: parseFloat(priceStr),
        timestamp: new Date(data.transactTime).toISOString(),
      };

      return event;
    } catch (error: any) {
      console.error('EXECUTE ORDER ERROR', error?.response?.data || error);
      throw new Error(
        error?.response?.data?.msg ||
          error?.message ||
          'Binance order failed'
      );
    }
  }
}
