'use client';

import React, { useState, useEffect } from 'react';
import { IEvent, IParticipant } from '@/lib/types';
import Button from '@/components/ui/Button';
import SignOutButton from '@/components/ui/SignOutButton';
import Select from '@/components/ui/Select';
import Spinner from '@/components/ui/Spinner';
import StudentEventScanner from '@/components/student/StudentEventScanner';
import { useSession } from '@/hooks/useSession';

export default function StudentPage() {
  const { session, isLoading: isSessionLoading } = useSession();

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    document.body.style.fontFamily = "'Poppins', sans-serif";
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // State for managing UI
  const [allEvents, setAllEvents] = useState<IEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for the result
  const [participant, setParticipant] = useState<IParticipant | null>(null);

  // Fetch all events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        if (data.success) {
          setAllEvents(data.data);
          if (data.data.length > 0 && data.data[0]._id) {
            setSelectedEventId(String(data.data[0]._id));
          }
        } else {
          setError(data.error || 'Failed to load events.');
        }
      } catch {
        setError('Failed to load events.');
      }
    };
    fetchEvents();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !selectedEventId) {
      setError('Session expired or event not selected.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setParticipant(null);

    try {
      // 1. Try to find an existing participant
      const findRes = await fetch('/api/participants/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.email, eventId: selectedEventId }),
      });

      const findResult = await findRes.json();

      if (findRes.ok && findResult.success) {
        setParticipant(findResult.data);
      } else {
        // 2. Not found? Create one using session data
        const createRes = await fetch('/api/participants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: session.name,
            email: session.email,
            eventId: selectedEventId
          }),
        });

        const createResult = await createRes.json();
        if (!createRes.ok || !createResult.success) {
          throw new Error(createResult.error || 'Failed to create participant');
        }
        setParticipant(createResult.data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSelection = () => {
    setParticipant(null);
    setError(null);
  };

  const getEventName = (id: string) => {
    return allEvents.find(event => String(event._id) === id)?.name || 'Event';
  };

  const getEventDetails = (id: string) => {
    return allEvents.find(event => String(event._id) === id);
  };

  if (isSessionLoading) {
    return (
      <div className="dark min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-300 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Spinner size={48} />
          <p className="text-gray-400 animate-pulse">Loading your session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="dark min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-300 flex flex-col items-center justify-center p-4">
        <div className="bg-gray-900/50 backdrop-blur-lg p-8 rounded-2xl border border-red-900/50 shadow-2xl max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-500">Session Expired</h2>
          <p className="text-gray-400">Your session has expired. Please log in again to continue.</p>
          <Button onClick={() => window.location.href = '/login'} className="w-full">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-300 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 bg-gray-900/30 backdrop-blur-sm p-4 rounded-xl border border-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {session?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300">{session?.name}</p>
              <p className="text-xs text-gray-500">{session?.email}</p>
            </div>
          </div>
          <SignOutButton />
        </div>

        {!participant ? (
          <form
            onSubmit={handleRegister}
            className="bg-gray-900/50 backdrop-blur-lg p-8 md:p-10 rounded-3xl border border-gray-800/50 shadow-2xl space-y-8"
          >
            {/* Hero Section */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-4 shadow-lg shadow-orange-500/20">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Welcome Back!
              </h1>
              <p className="text-gray-400 text-lg">
                Select an event to activate your check-in scanner
              </p>
            </div>

            {/* Event Selection */}
            <div className="space-y-4">
              <Select
                id="event"
                label="Choose Your Event"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                disabled={allEvents.length === 0}
                required
              >
                {allEvents.length === 0 ? (
                  <option value="" disabled>Loading events...</option>
                ) : (
                  <>
                    <option value="" disabled>-- Select an Event --</option>
                    {allEvents.map((event) => (
                      <option key={String(event._id)} value={String(event._id)}>
                        {event.name} • {new Date(event.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </option>
                    ))}
                  </>
                )}
              </Select>

              {/* Event Preview Card */}
              {selectedEventId && (
                <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-4 space-y-2 animate-in fade-in duration-300">
                  <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider">Selected Event</p>
                  <p className="text-white font-semibold text-lg">{getEventName(selectedEventId)}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(getEventDetails(selectedEventId)?.date || '').toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start space-x-3 animate-in fade-in duration-300">
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              variant="primary" 
              className="w-full h-14 text-lg font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300" 
              disabled={isLoading || !selectedEventId}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Spinner size={20} />
                  <span>Activating Scanner...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <span>Activate Scanner</span>
                </div>
              )}
            </Button>
          </form>
        ) : (
          <div className="bg-gray-900/50 backdrop-blur-lg p-8 md:p-10 rounded-3xl border border-gray-800/50 shadow-2xl space-y-6">
            {/* Scanner Header */}
            <div className="text-center space-y-3 pb-6 border-b border-gray-800">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-2 shadow-lg shadow-green-500/20">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white">
                Scanner Active
              </h1>
              <div className="inline-block bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-2">
                <p className="text-orange-400 font-semibold">
                  {getEventName(participant.eventId ? String(participant.eventId) : '')}
                </p>
              </div>
            </div>

            {/* Scanner Component */}
            <div className="space-y-4">
              <StudentEventScanner
                participantId={participant._id ? String(participant._id) : ''}
                participantName={participant.name}
              />
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Participant Info</p>
              <div className="space-y-1">
                <p className="text-white font-medium">{participant.name}</p>
                <p className="text-sm text-gray-400">{participant.email || session?.email}</p>
                <p className="text-xs text-gray-500">ID: {participant._id ? String(participant._id).slice(-8) : 'N/A'}</p>
              </div>
            </div>

            {/* Back Button */}
            <Button 
              onClick={handleBackToSelection}
              variant="secondary" 
              className="w-full h-12 font-medium"
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Event Selection</span>
              </div>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}