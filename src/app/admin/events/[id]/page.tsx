import React from 'react';
import { IEvent } from '@/lib/types';
import ParticipantList from '@/components/admin/ParticipantList';
import EventQrDisplay from '@/components/admin/EventQrDisplay';
import mongoose from 'mongoose';

// Re-usable Error Component
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
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
      </div>
      {/* Error Card */}
      <div className="bg-slate-900/80 backdrop-blur-2xl p-10 rounded-3xl border border-red-500/20 shadow-2xl max-w-md w-full text-center space-y-6 z-10 relative">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-3xl flex items-center justify-center mx-auto backdrop-blur-xl border border-red-500/30 shadow-2xl">
            <svg
              className="w-12 h-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24"
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
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-gray-400 leading-relaxed">{message}</p>
          {id && (
            <p className="text-gray-600 text-sm font-mono pt-2">ID: {id}</p>
          )}
        </div>
        <a
          href="/admin"
          className="inline-block w-full h-12 px-6 py-3 text-base font-semibold bg-orange-500 text-black rounded-lg shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:bg-orange-600 transition-all duration-300"
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  );
};
// -------------------------------------

// Function to fetch events on the server
async function getEventDetails(id: string) {
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
      cache: 'no-store', // This ensures data is fresh
      headers: { 'Content-Type': 'application/json' },
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
    throw error;
  }
}

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
    const eventData = await getEventDetails(id);
    if (eventData && eventData._id) {
      event = eventData as IEvent;
    } else {
      errorMessage = 'Event data is incomplete or invalid';
    }
  } catch (error: unknown) {
    errorMessage = error instanceof Error ? error.message : String(error);
  }

  if (errorMessage || !event || !event._id) {
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
    // This layout is correct:
    // min-h-screen for mobile scrolling
    // lg:h-screen & lg:overflow-hidden for fixed desktop
    <div className="dark min-h-screen lg:h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-gray-300 p-4 md:p-6 relative lg:overflow-hidden">
      
      {/* Animated background elements */}
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
      <div className="container mx-auto relative flex-1 flex flex-col">
        
        {/* Layout container: flex-col (mobile) and grid (desktop) */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 md:gap-8 flex-1 min-h-0">
          
          {/* --- Item 1: Header --- */}
          {/* This card can keep the blur, it doesn't open a modal */}
          <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-2xl p-5 rounded-3xl border border-slate-800/50 shadow-2xl flex-shrink-0">
            <h1 className="text-4xl font-black bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent leading-tight">
              {event.name}
            </h1>
         
            <div className="relative group pt-3">
              <div className="relative space-y-1.5">
                <p className="text-gray-300 text-sm">
                  {new Date(event.date).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24"
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
            </div>
          </div>

          {/* --- Item 2: QR Code --- */}
          {/* This card can also keep the blur */}
          <div className="lg:col-span-1 lg:row-span-2">
            <div className="bg-slate-900/60 backdrop-blur-2xl p-6 md:p-8 rounded-3xl border border-slate-800/50 shadow-2xl flex flex-col items-center">
              <div className="text-center space-y-3 pb-6 border-b border-slate-800/50 w-full">
                <div className="relative inline-block">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-3xl shadow-2xl shadow-orange-500/30 relative z-10">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 001-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-700 rounded-3xl blur-2xl opacity-40 animate-pulse"></div>
                </div>
                <h2 className="text-2xl font-black text-gray-200 pt-3">
                  Live Check-in
                </h2>
              </div>
              <div className="pt-6 flex flex-col items-center gap-6">
                <EventQrDisplay eventId={String(event._id)} />
                <p className="text-gray-400 text-center max-w-xs text-sm">
                  Students scan this code with their device to mark their
                  attendance.
                </p>
              </div>
            </div>
          </div>

          {/* --- Item 3: List (THE FIX IS HERE) --- */}
          {/*
            I have REMOVED `backdrop-blur-2xl` from this div.
            This will stop it from trapping your modal.
            The `bg-slate-900/60` provides a solid (but still transparent)
            background so it still looks like a card.
          */}
          <div className="lg:col-span-2 bg-slate-900/60 rounded-3xl border border-slate-800/50 shadow-2xl flex-1 min-h-0 flex flex-col p-6 md:p-8">
            <ParticipantList event={event} />
          </div>

        </div>
      </div>
    </div>
  );
}