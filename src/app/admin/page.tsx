// src/app/admin/page.tsx
import React from 'react';
import EventList from '@components/admin/EventList';
import SignOutButton from '@/components/ui/SignOutButton';
import { IEvent } from '@lib/types';

async function getEvents() {
  try {
    // We use the full URL because this fetch runs on the server
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/events`, {
      cache: 'no-store', // Ensure fresh data
    });

    if (!res.ok) {
      throw new Error('Failed to fetch events');
    }
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error(error);
    return []; // Return empty array on error
  }
}

export default async function AdminDashboardPage() {
  const initialEvents: IEvent[] = await getEvents();

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 dark min-h-screen bg-black text-gray-300">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 mb-2">
              Events Dashboard
            </h1>
        <SignOutButton />
      </div>
      <EventList initialEvents={initialEvents} />
    </div>
  );
}

