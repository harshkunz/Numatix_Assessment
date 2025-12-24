'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import OrderPanel from '../../../components/trading/OrderPanel';
import ChartPanel from '../../../components/trading/ChartPanel';
import PositionsTable from '../../../components/trading/PositionsTable';
import OrdersTable from '../../../components/trading/OrdersTable';
import TradesTable from '../../../components/trading/TradesTable';
import AccountPanel from '../../../components/trading/AccountPanel';
import Topbar from '../../../components/layout/Topbar';
import { useTradingStore } from '../../../store/trading.store';
import { fetchAccountDetails } from '../../../services/user.service';

type Tab = 'positions' | 'orders' | 'trades';

export default function TradePage() {
  const { symbol } = useParams();
  const [activeTab, setActiveTab] = useState<Tab>('positions');
  const { updateAccountDetails } = useTradingStore();

  useEffect(() => {
    const loadAccountDetails = async () => {
      try {
        const accountDetails = await fetchAccountDetails();
        updateAccountDetails(accountDetails);
      } catch (error) {
        console.error('Failed to load account details on mount:', error);
      }
    };
    loadAccountDetails();
  }, [updateAccountDetails]);

  return (
  <div className=''>
    <Topbar />
    <div className="flex h-full gap-4 px-6">
      <div className="flex flex-col w-[400px] gap-4">
        <OrderPanel />
        <AccountPanel />
      </div>

      <div className="flex flex-col flex-1 min-w-0 gap-4">
        <ChartPanel symbol={symbol as string} />

        <div className="p-4 flex-1 flex flex-col rounded shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('positions')}
                className={`px-3 py-1 text-sm border rounded ${
                  activeTab === 'positions'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-600'
                }`}
              >
                Positions
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3 py-1 text-sm border rounded ${
                  activeTab === 'orders'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-600'
                }`}
              >
                Orders
              </button>

              <button
                onClick={() => setActiveTab('trades')}
                className={`px-3 py-1 text-sm border rounded ${
                  activeTab === 'trades'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-600'
                }`}
              >
                Trades
              </button>
            </div>

            <div>
              <input
                className="border px-4 py-1 text-sm w-52 rounded outline-none"
                placeholder="🔍︎ Search"
              />
            </div>

          </div>

          <div className="flex-1 overflow-auto">
            {activeTab === 'positions' && <PositionsTable />}
            {activeTab === 'orders' && <OrdersTable />}
            {activeTab === 'trades' && <TradesTable />}
          </div>
        </div>
      </div>
    </div>
  </div> 
  );
}
