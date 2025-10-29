import React from 'react';
import { IEvent } from '@/lib/types';
import ParticipantList from '@/components/admin/ParticipantList';
import EventQrDisplay from '@/components/admin/EventQrDisplay';
import mongoose from 'mongoose';

// Function to fetch events on the server (no changes)
async function getEventDetails(id: string) {
  // Add better validation
  if (!id) {
    throw new Error('Event ID is required');
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid Event ID format');
  }

  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[getEventDetails] Error:', message);
    throw error; // Re-throw to be handled by the caller
  }
}

// Re-usable Error Component styled like the Student Page
const StyledErrorDisplay = ({
  id,
  message,
  title,
}: {
  id?: string;
  message: string;
  title: string;
}) => {
  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-gray-300 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background (from StudentPage) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-2xl p-10 rounded-3xl border border-red-500/20 shadow-2xl max-w-md w-full text-center space-y-6 z-10 relative">
        <div className="relative">
          {/* Icon (from StudentPage) */}
          <div className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-3xl flex items-center justify-center mx-auto backdrop-blur-xl border border-red-500/30 shadow-2xl">
            <svg
              className="w-12 h-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-3xl blur-2xl animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {/* Dynamic Title */}
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
            {title}
          </h2>
          {/* Dynamic Message */}
          <p className="text-gray-400 leading-relaxed">{message}</p>
          {id && (
            <p className="text-gray-600 text-sm font-mono pt-2">ID: {id}</p>
          )}
        </div>
        {/* Link styled as a Button (from CreateEventForm) */}
        <a
          href="/admin"
          className="inline-block px-6 py-3 bg-orange-500 text-black border-2 border-orange-600 rounded-lg font-semibold hover:bg-orange-600 hover:border-orange-700 transition-all shadow-lg shadow-orange-500/30"
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  );
};

// This is the main page component
export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  if (!id) {
    return (
      <StyledErrorDisplay
        title="Missing ID"
        message="Event ID is required to view this page."
      />
    );
  }

  let event: IEvent | null = null;
  let errorMessage: string | null = null;

  try {
    event = await getEventDetails(id);
  } catch (error: unknown) {
    errorMessage = error instanceof Error ? error.message : String(error);
  }

  // Handle all errors (fetch error or not found)
  if (!event || errorMessage) {
    return (
      <StyledErrorDisplay
        id={id}
        title={errorMessage ? 'Error Loading Event' : 'Event Not Found'}
        message={
          errorMessage ||
          'The event you are looking for does not exist or could not be loaded.'
        }
      />
    );
  }

  // Main success UI
  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-gray-300 p-4 md:p-6 relative overflow-hidden">
      {/* Animated background (from StudentPage) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/3 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      {/* Main Content Container */}
      <div className="container mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Column 1: Event Details & Participant List */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Event Details Card (Styled like StudentPage) */}
            <div className="bg-slate-900/60 backdrop-blur-2xl p-6 md:p-8 rounded-3xl border border-slate-800/50 shadow-2xl space-y-4">
              <h1 className="text-4xl font-bold text-orange-400 mb-2">
                {event.name}
              </h1>
              <p className="text-gray-300 text-lg mb-1">
                {new Date(event.date).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </p>
              <div className="flex items-center space-x-2 text-gray-400">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{event.location}</span>
              </div>
            </div>

            {/* Participant List (Wrapped in new styled card) */}
            <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-slate-800/50 shadow-2xl overflow-hidden">
              {/* Note: ParticipantList component might need internal padding removed if it has its own, 
                  but p-6/p-8 is applied here to contain it. 
                  If ParticipantList has its own card, just place it here without the wrapper. */}
              <div className="p-6 md:p-8">
                <ParticipantList event={event} />
              </div>
            </div>
          </div>

          {/* Column 2: Event QR Code Display (Styled like StudentPage) */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/60 backdrop-blur-2xl p-6 md:p-8 rounded-3xl border border-slate-800/50 shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-200 mb-6 text-center">
                Event Check-in
              </h2>
              <EventQrDisplay
                eventId={String(event._id)}
                eventName={event.name}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}