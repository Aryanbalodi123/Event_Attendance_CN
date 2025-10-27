// src/app/admin/page.tsx
import React from 'react';
import EventList from '@components/admin/EventList';
import { IEvent } from '@lib/types';

// Function to fetch events on the server
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
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">
        Event Dashboard
      </h1>
      <EventList initialEvents={initialEvents} />
    </div>
  );
}

// Add this to your .env.local if deploying
// NEXT_PUBLIC_APP_URL=https://your-deployment-url.com