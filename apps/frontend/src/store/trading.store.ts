import { useState } from 'react';

export const useTradingStore = () => {
  const [symbols, setSymbols] = useState(['BTCUSDT', 'ETHUSDT']);
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [accountDetails, setAccountDetails] = useState({
    marginRatio: 0,
    maintenanceMargin: 0,
    marginBalance: 0,
  });

  const updateAccountDetails = (details: { marginRatio: number; maintenanceMargin: number; marginBalance: number; }) => {
    setAccountDetails(details);
  };

  return { symbols, selectedSymbol, setSelectedSymbol, accountDetails, updateAccountDetails };
};
