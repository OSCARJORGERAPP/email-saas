'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = '/dashboard';
    }
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Landing Page */}
      <nav className="border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Email SaaS</h1>
          <button
            onClick={() => (window.location.href = '/auth')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
          >
            Login
          </button>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">Send Emails at Scale</h2>
        <p className="text-xl text-gray-400 mb-8">
          Manage customers, create email templates with Handlebars, and send campaigns
        </p>
        <button
          onClick={() => (window.location.href = '/auth')}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
        >
          Get Started Free
        </button>
      </section>

      <section className="bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-12">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-700 rounded-lg">
              <h4 className="text-xl font-semibold mb-3">Customer Management</h4>
              <p className="text-gray-400">
                Create, update, and manage your customer lists with ease
              </p>
            </div>
            <div className="p-6 bg-gray-700 rounded-lg">
              <h4 className="text-xl font-semibold mb-3">Email Templates</h4>
              <p className="text-gray-400">
                Build dynamic email templates using Handlebars syntax
              </p>
            </div>
            <div className="p-6 bg-gray-700 rounded-lg">
              <h4 className="text-xl font-semibold mb-3">Campaign Sending</h4>
              <p className="text-gray-400">
                Send personalized campaigns to multiple customers instantly
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
