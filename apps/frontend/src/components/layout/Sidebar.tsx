'use client';

import { useState } from 'react';
import { useTradingStore } from '../../store/trading.store';

export default function Sidebar() {
  const { symbols, selectedSymbol, setSelectedSymbol } = useTradingStore();
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="h-full text-white bg-blue-600 hover:bg-blue-700 px-4 py-3 flex items-center justify-center border-r border-gray-200"
      >
        Open
      </button>
    );
  }

  return (
    <aside className="h-full w-60 bg-white border-r border-gray-200 flex flex-col">
      <div className="flex items-center justify-between bg-gray-700">
        <span className="text-base text-white px-4">Markets</span>
        <button
          onClick={() => setOpen(false)}
          className="text-white bg-red-600 hover:bg-red-700 px-4 py-3"
        >
          Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {symbols.map((sym) => (
          <button
            key={sym}
            onClick={() => setSelectedSymbol(sym)}
            className={`w-full text-left px-3 py-3 text-sm ${
              selectedSymbol === sym
                ? 'bg-green-500 text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {sym}
          </button>
        ))}

        {symbols.length === 0 && (
          <div className="px-3 py-2 text-xs text-gray-400">
            No symbols loaded.
          </div>
        )}
      </div>
    </aside>
  );
}
