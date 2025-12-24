export interface Order {
  orderId: string;
  userId: number;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET';
  quantity: number;
  timestamp: string;
}