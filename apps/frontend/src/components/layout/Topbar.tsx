'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/auth.service'

export default function Topbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await authService.logout();
    router.push('/');
  };
    
  return (
    <header className="w-full px-20 py-3 bg-white shadow-md rounded flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold tracking-[0.1em] text-gray-800">
          TRADER
        </span>
      </div>

      <div className="flex items-center gap-5">
          <button className="flex items-center gap-3 px-3 py-2 rounded-full border border-gray-300 text-xs text-gray-700 bg-white">
            <span className="inline-flex w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className='text-black'>Live trading</span>
        </button>

        <button 
          onClick={handleLogout}
          className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700">
          Logout
        </button>
    </div>
    </header>
  );
}
