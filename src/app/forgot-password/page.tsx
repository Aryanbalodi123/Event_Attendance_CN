// src/app/forgot-password/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Spinner from '@/components/ui/Spinner';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

type Role = 'student' | 'admin';

export default function ForgotPasswordPage() {
  const [role, setRole] = useState<Role>('student');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load Poppins font (same as login)
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      if (link.parentNode) document.head.removeChild(link);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send reset link');
      }

      setSuccess(data.message || 'If an account exists, a reset link has been sent to your email.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ fontFamily: '"Poppins", sans-serif' }}>
      <div className="absolute inset-0 bg-linear-to-b from-black via-zinc-900 to-orange-950" />
      <div className="relative z-10 min-h-screen flex flex-col">
        <nav className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <div className="w-5 h-5 bg-orange-600 rounded" />
            </div>
            <span className="text-white font-semibold text-xl">CN&apos;s Events Attendance Portal</span>
          </div>
        </nav>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <form onSubmit={handleSubmit} className="bg-black bg-opacity-60 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md border border-orange-900 border-opacity-50">
            <h2 className="text-white text-2xl font-semibold mb-6 text-center">
              Forgot Password
            </h2>

            {/* Show success message */}
            {success ? (
              <div className="text-green-400 text-center space-y-4">
                <p>{success}</p>
                <Button onClick={() => window.location.href = '/login'} variant="secondary">
                  Back to Login
                </Button>
              </div>
            ) : (
              // Show the form
              <>
                <div className="flex w-full mb-6">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`w-1/2 py-3 font-medium transition ${
                      role === 'student'
                        ? 'bg-orange-600 text-white rounded-l-lg'
                        : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700 rounded-l-lg'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`w-1/2 py-3 font-medium transition ${
                      role === 'admin'
                        ? 'bg-orange-600 text-white rounded-r-lg'
                        : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700 rounded-r-lg'
                    }`}
                  >
                    Admin
                  </button>
                </div>

                <div className="space-y-4">
                  <Input
                    id="email"
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="bg-zinc-900 bg-opacity-50 border-orange-900 border-opacity-30 focus:border-orange-500"
                  />

                  {error && (
                    <p className="text-red-400 text-sm text-center">{error}</p>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-medium transition h-12 flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? <Spinner size={24} /> : 'Send Reset Link'}
                  </Button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}