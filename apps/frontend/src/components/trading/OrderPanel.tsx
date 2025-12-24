'use client';
import { useState, useEffect } from 'react';
import { useTradingStore } from '../../store/trading.store';
import { tradingService } from '../../services/trading.service';
import { fetchAccountDetails } from '../../services/user.service';

export default function OrderPanel() {
  const { selectedSymbol, updateAccountDetails } = useTradingStore();
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [type, setType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  const totalPrice =
    quantity && price ? (Number(quantity) * Number(price) * 1000).toString() : '';

  useEffect(() => {
    let cancelled = false;

    const fetchPrice = async () => {
      try {
        const res = await fetch(
          `https://testnet.binance.vision/api/v3/ticker/price?symbol=${selectedSymbol}`
        );
        const data = await res.json();
        if (!cancelled && type === 'MARKET') {
          setPrice(data.price);
        }
      } catch (err) {
        console.error('Failed to fetch mark price', err);
      }
    };

    fetchPrice();
    const id = setInterval(fetchPrice, 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [selectedSymbol, type]);

  const placeOrder = async () => {
    try {
      await tradingService.placeOrder({
        symbol: selectedSymbol,
        side,
        type,
        quantity: parseFloat(quantity),
        price: parseFloat(price),
      });

      const accountDetails = await fetchAccountDetails();
      updateAccountDetails(accountDetails);
    } catch (error) {
      console.error('Order failed:', error);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Order Panel</h2>

      <div className="mb-3">
        <div className="text-xs font-semibold mb-1">Side</div>
        <div>
          <button
            onClick={() => setSide('BUY')}
            className={`px-4 py-2 ${
              side === 'BUY' ? 'bg-green-500 text-white' : 'bg-gray-300'
            } rounded-l`}
          >
            Buy
          </button>
          <button
            onClick={() => setSide('SELL')}
            className={`px-4 py-2 ${
              side === 'SELL' ? 'bg-red-500 text-white' : 'bg-gray-300'
            } rounded-r`}
          >
            Sell
          </button>
        </div>
      </div>

      <div className="mb-3">
        <div className="text-xs font-semibold mb-1">Order Type</div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as 'MARKET' | 'LIMIT')}
          className="w-full p-2 border rounded"
        >
          <option value="MARKET">Market</option>
          <option value="LIMIT">Limit</option>
          <option value="STOP MARKET">Stop Market</option>
        </select>
      </div>

      <div className="mb-3">
        <div className="text-xs font-semibold mb-1">Quantity ({selectedSymbol})</div>
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      {type === 'LIMIT' && (
        <div className="mb-3">
          <div className="text-xs font-semibold mb-1">Limit Price (USDT)</div>
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      )}

      <div className="mb-3">
        <div className="text-xs font-semibold mb-1">Total</div>
        <div className="w-full p-2 border rounded bg-gray-100 flex justify-between">
          <span>=</span>
          <span>
            {totalPrice ? `${Number(totalPrice).toFixed(2)} USDT` : '0.00 USDT'}
          </span>
        </div>
      </div>

      <button
        onClick={placeOrder}
        className="w-full p-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
        disabled={!quantity || !price}
      >
        Place Order
      </button>
    </div>
  );
}
