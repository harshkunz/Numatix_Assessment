import Link from 'next/link';
import Sidebar from '../components/layout/Sidebar';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <main className="flex flex-1 border-l border-gray-300 items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-semibold text-gray-800">
            Trading Platform
          </h1>

          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
            >
              Register
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
