'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  tenantId: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-white">Email SaaS</h1>
          {user && (
            <div className="text-sm text-gray-400">
              Tenant: <span className="text-blue-400">{user.tenantId.slice(0, 8)}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <div className="text-sm">
                <p className="text-gray-300">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition text-white font-semibold"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
