"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/Button';

export default function SignOutButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signout', { method: 'POST' });
      if (res.ok) {
        // Clear client-side state if any, then redirect to login
        window.location.href = '/login';
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to sign out');
      }
    } catch (err) {
      console.error('[SignOutButton] Error:', err);
      alert('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignOut}
      variant="secondary"
      className={className}
      disabled={loading}
    >
      {loading ? 'Signing out...' : 'Sign out'}
    </Button>
  );
}
