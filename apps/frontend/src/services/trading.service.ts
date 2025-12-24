import api from './api';

export const tradingService = {
  async placeOrder(order: any) {
    const response = await api.post('/api/trading/orders', order);
    return response.data;
  },
  async getOrders() {
    const response = await api.get('/api/trading/orders');
    return response.data;
  },
  async getPositions() {
    const response = await api.get('/api/trading/positions');
    return response.data;
  },
  async getTrades() {
    const response = await api.get('/api/trading/trades');
    return response.data;
  },
  
  async getCandles(symbol: string, timeframe: string) {
    const intervalMap: Record<string, string> = {
      '1m': '1m',
      '5m': '5m',
      '1d': '1d',
      '1w': '1w',
    };

    const interval = intervalMap[timeframe] || '1d';

    const res = await fetch(
      `https://testnet.binance.vision/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=200`
    );

    const data = await res.json();

    return data.map((k: any) => ({
      time: k[0] / 1000,
      open: Number(k[1]),
      high: Number(k[2]),
      low: Number(k[3]),
      close: Number(k[4]),
    }));
  },

  
  
};
