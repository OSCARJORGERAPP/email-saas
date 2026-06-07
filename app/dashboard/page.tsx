'use client';

import { useEffect, useState } from 'react';

interface Stats {
  totalClients: number;
  totalTemplates: number;
  totalCampaigns: number;
  totalEmailsSent: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          setStats(await response.json());
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-gray-400">Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>

      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Clients" value={stats.totalClients} />
          <StatCard label="Templates" value={stats.totalTemplates} />
          <StatCard label="Campaigns" value={stats.totalCampaigns} />
          <StatCard label="Emails Sent" value={stats.totalEmailsSent} />
        </div>
      ) : (
        <div className="text-gray-400">Unable to load statistics</div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h3 className="text-gray-400 text-sm font-medium mb-2">{label}</h3>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
