export interface Order {
  transaction: string;
  size: number;
  entryPrice: number;
  marketPrice: number;
  realizedPnL: number;
  unrealizedPnL: number;
}