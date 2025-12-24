'use client';

import { useEffect, useState } from 'react';
import { fetchAccountDetails } from '../../services/user.service';
import { useWebSocket } from '../../hooks/useWebSocket';
import { WS_URL } from '../../utils/constants';

type AccountSummary = {
  marginRatio: number;
  maintenanceMargin: number;
  marginBalance: number;
};

export default function AccountPanel() {
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const { lastMessage } = useWebSocket(WS_URL);

  // Initial fetch
 const loadAccount = async () => {
    try {
      const data = await fetchAccountDetails();
      setAccount(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAccount();
  }, []);

  // Live updates from WebSocket
  useEffect(() => {
    if (!lastMessage || lastMessage.type !== 'ORDER_UPDATE') return;
    //console.log('lastMessage');
    loadAccount();
  }, [lastMessage]);

  return (
    <div className="bg-white p-4 rounded shadow-md mt-4">
      <h2 className="text-xl font-semibold mb-4">Account</h2>
      {!account ? (
        <p className="text-sm text-gray-500">
          No account data yet. Place a trade to fetch account details.
        </p>
      ) : (
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Margin Ratio</span>
            <span className="font-medium">
              {account.marginRatio.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Maintenance Margin</span>
            <span className="font-medium">
              {account.maintenanceMargin.toFixed(6)} USDT
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Margin Balance</span>
            <span className="font-medium">
              {account.marginBalance.toFixed(6)} USDT
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
