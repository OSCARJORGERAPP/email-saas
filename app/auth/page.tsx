'use client';

import { useState } from 'react';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [stage, setStage] = useState<'input' | 'verify'>('input');
  const [magicToken, setMagicToken] = useState('');

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/auth/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || 'Failed to send magic link');
        return;
      }

      setMagicToken(data.token);
      setMessage('Magic link sent! Check your email or use the token below.');
      setStage('verify');
    } catch (error) {
      setMessage('Error sending magic link');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: magicToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || 'Failed to verify token');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/dashboard';
    } catch (error) {
      setMessage('Error verifying token');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            Email SaaS Login
          </h1>

          {stage === 'input' ? (
            <form onSubmit={handleSendMagicLink}>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition"
              >
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyToken}>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm mb-2">
                  Verification Token
                </label>
                <input
                  type="text"
                  value={magicToken}
                  onChange={(e) => setMagicToken(e.target.value)}
                  placeholder="Paste token from email"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStage('input');
                  setMagicToken('');
                  setMessage('');
                }}
                className="w-full mt-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
              >
                Back
              </button>
            </form>
          )}

          {message && (
            <div className="mt-4 p-3 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-300">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
