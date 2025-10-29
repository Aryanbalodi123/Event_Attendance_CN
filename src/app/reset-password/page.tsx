// src/app/reset-password/page.tsx
'use client';

// Import Suspense for useSearchParams
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Spinner from '@/components/ui/Spinner';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

// A wrapper component to safely use useSearchParams, as it requires <Suspense>
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token'); // Get token from URL (e.g., ?token=...)

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('Invalid or missing reset token. Please request a new link.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(data.message || 'Password has been reset successfully!');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-black bg-opacity-60 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md border border-orange-900 border-opacity-50">
      <h2 className="text-white text-2xl font-semibold mb-6 text-center">
        Reset Your Password
      </h2>

      {success ? (
        <div className="text-green-400 text-center space-y-4">
          <p>{success}</p>
          <p className="text-sm text-gray-400">Redirecting to login...</p>
          <Button onClick={() => router.push('/login')} variant="secondary">
            Back to Login
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            id="password"
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="bg-zinc-900 bg-opacity-50 border-orange-900 border-opacity-30 focus:border-orange-500"
          />
          <Input
            id="confirmPassword"
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="bg-zinc-900 bg-opacity-50 border-orange-900 border-opacity-30 focus:border-orange-500"
          />

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
          {!token && (
             <p className="text-red-400 text-sm text-center">No reset token found in URL. Please request a new link.</p>
          )}

          <Button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-medium transition h-12 flex items-center justify-center"
            disabled={isLoading || !token}
          >
            {isLoading ? <Spinner size={24} /> : 'Reset Password'}
          </Button>
        </div>
      )}
    </form>
  );
}

// Main page component that wraps the form in Suspense
export default function ResetPasswordPage() {
  // Load Poppins font
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
          {/* Suspense is required for useSearchParams */}
          <Suspense fallback={<Spinner size={40} />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}