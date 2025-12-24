import { useState, useEffect } from 'react';
import { tradingService } from '../services/trading.service';

export const useChart = (symbol: string, timeframe: string) => {
  const [candles, setCandles] = useState<any[]>([]);

  useEffect(() => {
    tradingService.getCandles(symbol, timeframe).then(setCandles);
  }, [symbol, timeframe]);

  return candles;
};
