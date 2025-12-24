import { useState, useEffect } from 'react';
import { tradingService } from '../services/trading.service';

export const useOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    tradingService.getOrders().then(setOrders);
  }, []);

  return orders;
};
