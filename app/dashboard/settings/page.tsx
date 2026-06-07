'use client';

import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  tenantId: string;
  accessCount?: number;
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>

      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 max-w-md">
        <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>

        {user && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Email</label>
              <p className="text-white font-mono">{user.email}</p>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Tenant ID</label>
              <p className="text-white font-mono text-xs break-all">{user.tenantId}</p>
            </div>

            {user.accessCount !== undefined && (
              <div>
                <label className="block text-gray-400 text-sm mb-1">Login Count</label>
                <p className="text-white">{user.accessCount}</p>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="w-full mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 bg-gray-800 p-6 rounded-lg border border-gray-700 max-w-md">
        <h2 className="text-xl font-semibold text-white mb-4">System Information</h2>
        <ul className="space-y-2 text-gray-400 text-sm">
          <li>Application: Email SaaS v0.1.0</li>
          <li>Framework: Next.js 14</li>
          <li>Database: MongoDB</li>
          <li>Auth Method: Magic Link + JWT</li>
        </ul>
      </div>
    </div>
  );
}
