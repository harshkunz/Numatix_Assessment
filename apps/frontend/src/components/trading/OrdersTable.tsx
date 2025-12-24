'use client';
import { useState, useEffect } from 'react';
import { tradingService } from '../../services/trading.service';

type OrderRow = {
  orderId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number | null;
  status: string;
  createdAt: string;
};

export default function OrdersTable() {
  const [orders, setOrders] = useState<OrderRow[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await tradingService.getOrders();
        const raw: any[] = Array.isArray(res) ? res : [];
        const data: OrderRow[] = raw.map((o) => ({
          orderId: o.orderId,
          symbol: o.symbol,
          side: o.side,
          quantity: Number(o.quantity),
          price: o.price != null ? Number(o.price) : null,
          status: o.status,
          createdAt: o.createdAt ?? o.timestamp,
        }));
        if (!cancelled) setOrders(data);
      } catch (err) {
        console.error('Failed to load orders', err);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Orders</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left">Time</th>
            <th className="py-2 text-left">Order ID</th>
            <th className="py-2 text-left">Transaction</th>
            <th className="py-2 text-left">Symbol</th>
            <th className="py-2 text-right">Size</th>
            <th className="py-2 text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={`${o.orderId}-${o.createdAt}`} className="border-b">
              <td className="py-2 text-left">
                {new Date(o.createdAt).toLocaleTimeString()}
              </td>
              <td className="py-2 text-left text-xs text-gray-500">
                {o.orderId}
              </td>
              <td className="py-2 text-left">
                {o.side}
              </td>
              <td className="py-2 text-left">
                {o.symbol}
              </td>
              <td className="py-2 text-right">{o.quantity}</td>
              <td className="py-2 text-right">{o.status}</td>
            </tr>
          ))}

          {orders.length === 0 && (
            <tr>
              <td colSpan={7} className="py-4 text-center text-gray-500">
                No orders yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
