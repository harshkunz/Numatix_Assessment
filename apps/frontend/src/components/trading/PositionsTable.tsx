'use client';
import { useState, useEffect } from 'react';
import { tradingService } from '../../services/trading.service';
import { useWebSocket } from '../../hooks/useWebSocket';
import { WS_URL } from '../../utils/constants';

type PositionRow = {
  symbol: string;
  side: string;
  size: number;
  entryPrice: number;
  marketPrice: number;
  realizedPnL: number;
  unrealizedPnL: number;
};

export default function PositionsTable( ) {
  const [positions, setPositions] = useState<PositionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { lastMessage } = useWebSocket(WS_URL);

  // Initial Value Updates
  const loadPositions = async () => {
    try {
      setLoading(true);
      const res = await tradingService.getPositions();
      const raw: any[] = Array.isArray(res) ? res : [];

      const data: PositionRow[] = raw.map((r) => ({
        symbol: r.symbol,
        side: r.side,
        size: Number(r.size),
        entryPrice: Number(r.entryPrice),
        marketPrice: 0,
        realizedPnL: 0,
        unrealizedPnL: 0,
      }));

      setPositions(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load positions');
      setPositions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPositions();
  }, []);

  // Live updates from WebSocket
  useEffect(() => {
    if (!lastMessage || lastMessage.type !== 'ORDER_UPDATE') return;
    //console.log('lastMessage');
    loadPositions();
  }, [lastMessage]);

  // Live Update Market Price
  useEffect(() => {
    if (positions.length === 0) return;
    let cancelled = false;

    const fetchPrices = async () => {
      try {
        const updated = await Promise.all(
          positions.map(async (p) => {
            const res = await fetch(
              `https://testnet.binance.vision/api/v3/ticker/price?symbol=${p.symbol}`
            );
            const data = await res.json();
            const px = Number(data.price);

            return {
              ...p,
              marketPrice: px,
              unrealizedPnL: (px - p.entryPrice) * p.size,
            };
          })
        );

        if (!cancelled) setPositions(updated);
      } catch (err) {
        console.error('Failed to fetch prices', err);
      }
    };

    fetchPrices();
    const id = setInterval(fetchPrices, 3000);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [positions.map((p) => p.symbol).join(',')]);


  if (loading) return <div className="p-4">Loading positions...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Positions</h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left"></th>
            <th className="py-2 text-left">Transaction</th>
            <th className="py-2 text-right">Size</th>
            <th className="py-2 text-right">Entry Price</th>
            <th className="py-2 text-right">Market Price</th>
            <th className="py-2 text-right">Realized PnL</th>
            <th className="py-2 text-right">Unrealized PnL</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((pos) => (
            <tr key={pos.symbol} className="border-b">
              <td className="py-2 flex items-center gap-2 text-right">
                {pos.side === 'SELL' ? (
                  <>
                    <span className="text-red-500 font-semibold">▲</span>
                  </>
                ) : (
                  <>
                    <span className="text-green-500 font-semibold">▼</span>
                  </>
                )}
              </td>
              <td className="py-2">{pos.symbol}</td>
              <td className="py-2 text-right">{pos.size}</td>
              <td className="py-2 text-right">
                $ {pos.entryPrice.toFixed(2)}
              </td>

              <td className="py-2 text-right flex items-center justify-end gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>
                  {pos.marketPrice
                    ? `$ ${pos.marketPrice.toFixed(2)}`
                    : '$ 0.00'}
                </span>
              </td>

              <td
                className={`py-2 text-right font-semibold ${
                  pos.realizedPnL > 0
                    ? 'text-green-500'
                    : pos.realizedPnL < 0
                    ? 'text-red-500'
                    : 'text-black'
                }`}
              >
                {pos.realizedPnL > 0 && '+ '}
                {'$ ' + pos.realizedPnL.toFixed(2)}
              </td>

              <td
                className={`py-2 text-right font-semibold ${
                  pos.unrealizedPnL > 0
                    ? 'text-green-500'
                    : pos.unrealizedPnL < 0
                    ? 'text-red-500'
                    : 'text-black'
                }`}
              >
                {pos.unrealizedPnL > 0 && '+ '}
                {'$ ' + pos.unrealizedPnL.toFixed(2)}
              </td>
            </tr>
          ))}

          {positions.length === 0 && (
            <tr>
              <td colSpan={6} className="py-4 text-center text-gray-500">
                No open positions.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
