'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/auth.service';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [binanceApiKey, setBinanceApiKey] = useState('');
  const [binanceSecretKey, setBinanceSecretKey] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { token } = await authService.register(
        email,
        password,
        binanceApiKey,
        binanceSecretKey,
      );
      localStorage.setItem('token', token);
      router.push('/trade/BTCUSDT');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="p-6 bg-white rounded shadow-md w-80"
      >
        <h2 className="text-2xl font-bold mb-4">Register</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
          required
        />

        <input
          type="text"
          placeholder="Binance API Key"
          value={binanceApiKey}
          onChange={e => setBinanceApiKey(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
          required
        />

        <input
          type="password"
          placeholder="Binance Secret Key"
          value={binanceSecretKey}
          onChange={e => setBinanceSecretKey(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full p-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
        >
          Register
        </button>

        <div className='text-center mt-4'>
          <span>Go to </span>
          <Link
            href="/login"
            className="text-blue-600 hover:underline"
          >
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}
