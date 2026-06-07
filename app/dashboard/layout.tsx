'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/auth';
      return;
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 p-6 min-h-[calc(100vh-60px)]">
      <nav className="space-y-2">
        <NavLink href="/dashboard" label="Dashboard" icon="📊" />
        <NavLink href="/dashboard/clients" label="Clients" icon="👥" />
        <NavLink href="/dashboard/templates" label="Templates" icon="📧" />
        <NavLink href="/dashboard/campaigns" label="Campaigns" icon="🚀" />
        <NavLink href="/dashboard/settings" label="Settings" icon="⚙️" />
      </nav>
    </aside>
  );
}

function NavLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <a
      href={href}
      className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-gray-300 hover:text-white"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </a>
  );
}
