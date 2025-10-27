import React from 'react';
import { IEvent } from '@/lib/types';
import ParticipantList from '@/components/admin/ParticipantList';
// NEW IMPORT
import EventQrDisplay from '@/components/admin/EventQrDisplay';
import mongoose from 'mongoose';

// Function to fetch events on the server
async function getEventDetails(id: string) {
  // Add better validation
  if (!id) {
    throw new Error('Event ID is required');
  }
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid Event ID format');
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/events/${id}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to fetch event');
    }

    const data = await res.json();
    return data.data;
  } catch (error: any) {
    console.error('[getEventDetails] Error:', error);
    throw error; // Re-throw to be caught by the component
  }
}

// This is the main page component
export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>; // params is now a Promise in Next.js 15+
}) {
  // Await params to get the actual object
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  console.log('[EventDetailsPage] Received ID:', id); // Debug log
  
  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-red-500 text-lg">Event ID is required</p>
      </div>
    );
  }

  try {
    const event = await getEventDetails(id);

    return (
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Event Details & Participant List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h1 className="text-3xl font-bold text-orange-500 mb-2">{event.name}</h1>
              <p className="text-gray-400 text-lg mb-1">
                {new Date(event.date).toLocaleString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
              <p className="text-gray-500">{event.location}</p>
            </div>

            <ParticipantList event={event} />
          </div>

          {/* Column 2: NEW Event QR Code Display */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4 text-center">Event Check-in</h2>
              <EventQrDisplay
                eventId={String(event._id)}
                eventName={event.name}
              />
            </div>
          </div>

        </div>
      </div>
    );
  } catch (error: any) {
    console.error('[EventDetailsPage] Error:', error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-red-500 text-lg mb-2">
          {error?.message || 'Error loading event'}
        </p>
        <p className="text-gray-500 text-sm">ID: {id}</p>
      </div>
    );
  }
}