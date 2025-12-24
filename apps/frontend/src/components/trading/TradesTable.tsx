'use client';
import { useEffect, useState } from 'react';
import { tradingService } from '../../services/trading.service';

type TradeRow = {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  realizedPnL: number;
  timestamp: string;
};

export default function TradesTable() {
  const [trades, setTrades] = useState<TradeRow[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await tradingService.getTrades();
        const raw: any[] = Array.isArray(res) ? res : [];
        const data: TradeRow[] = raw.map((t) => ({
          id: t.id ?? t.tradeId ?? `${t.orderId}-${t.timestamp}`,
          symbol: t.symbol,
          side: t.side,
          quantity: Number(t.quantity),
          price: Number(t.price),
          realizedPnL: Number(t.realizedPnL ?? 0),
          timestamp: t.timestamp,
        }));
        if (!cancelled) setTrades(data);
      } catch (err) {
        console.error('Failed to load trades', err);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Trades</h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left">Time</th>
            <th className="py-2 text-left">Symbol</th>
            <th className="py-2 text-left">Side</th>
            <th className="py-2 text-right">Size</th>
            <th className="py-2 text-right">Price</th>
            <th className="py-2 text-right">Realized PnL</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => (
            <tr key={t.id} className="border-b">
              <td className="py-2 text-left">
                {new Date(t.timestamp).toLocaleTimeString()}
              </td>
              <td className="py-2 text-left">{t.symbol}</td>
              <td className="py-2 text-left">{t.side}</td>
              <td className="py-2 text-right">{t.quantity}</td>
              <td className="py-2 text-right">
                {t.price ? `$${t.price.toFixed(2)}` : '--'}
              </td>
              <td className="py-2 text-right">
                {t.realizedPnL.toFixed(2)}
              </td>
            </tr>
          ))}

          {trades.length === 0 && (
            <tr>
              <td colSpan={6} className="py-4 text-center text-gray-500">
                No trades yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
