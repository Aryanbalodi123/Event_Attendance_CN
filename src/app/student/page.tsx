'use client';

import React, { useState, useEffect } from 'react';
import { IEvent, IParticipant } from '@/lib/types';
import Button from '@/components/ui/Button';
import SignOutButton from '@/components/ui/SignOutButton';
import Select from '@/components/ui/Select';
import Spinner from '@/components/ui/Spinner';
import StudentEventScanner from '@/components/student/StudentEventScanner';
import { useSession } from '@/hooks/useSession'; // Our new hook

export default function StudentPage() {
  const { session, isLoading: isSessionLoading } = useSession();

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
          if (data.data.length > 0 && data.data[0]._id) { // Ensure _id exists
            setSelectedEventId(String(data.data[0]._id));
          }
        } else {
          // If API returns an error message, show it
          setError(data.error || 'Failed to load events.');
        }
      } catch /* (err) */ { // FIX: Removed unused 'err' variable
        setError('Failed to load events.');
      }
    };
    fetchEvents();
  }, []); // Empty dependency array is correct here, fetch only once

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
    } catch (err: unknown) { // Use unknown for better type safety
       setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const getEventName = (id: string) => {
    // Ensure event._id is properly handled (might be ObjectId or string)
    return allEvents.find(event => String(event._id) === id)?.name || 'Event';
  };

  if (isSessionLoading) {
    return (
      <div className="dark min-h-screen bg-black text-gray-300 flex items-center justify-center p-4">
        <Spinner size={40} />
      </div>
    );
  }

  // Handle case where session is loaded but user is not logged in (e.g., token expired)
  if (!session) {
    return (
      <div className="dark min-h-screen bg-black text-gray-300 flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">You are not logged in or your session has expired.</p>
        <Button onClick={() => window.location.href = '/login'}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-black text-gray-300 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-400">Signed in as {session?.name}</div>
          <SignOutButton />
        </div>

        {!participant ? (
          <form
            onSubmit={handleRegister}
            className="bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-xl space-y-6"
          >
            <h1 className="text-3xl font-bold text-center text-orange-500 mb-2">
              Welcome, {session?.name}!
            </h1>
            <p className="text-center text-gray-400">
              Select an event to open your check-in scanner.
            </p>

            <Select
              id="event"
              label="Select Event"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              disabled={allEvents.length === 0}
              required // Make event selection mandatory
            >
              {allEvents.length === 0 ? (
                <option value="" disabled>Loading events...</option>
              ) : (
                <>
                  <option value="" disabled>-- Select an Event --</option>
                  {allEvents.map((event) => (
                    // Ensure event._id exists and is converted to string for key/value
                    <option key={String(event._id)} value={String(event._id)}>
                      {event.name} ({new Date(event.date).toLocaleDateString()})
                    </option>
                  ))}
                </>
              )}
            </Select>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <Button type="submit" variant="primary" className="w-full" disabled={isLoading || !selectedEventId}>
              {isLoading ? <Spinner size={20} /> : 'Open Scanner'}
            </Button>
          </form>
        ) : (
          <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-xl">
            <h1 className="text-3xl font-bold text-center text-white mb-2">
              {/* Ensure participant.eventId exists before trying to String() it */}
              Scan for: {getEventName(participant.eventId ? String(participant.eventId) : '')}
            </h1>
            <p className="text-center text-orange-500 text-lg mb-6">
              Logged in as: {session?.name}
            </p>
            <StudentEventScanner
              // Ensure participant._id exists before trying to String() it
              participantId={participant._id ? String(participant._id) : ''}
              participantName={participant.name}
            />
          </div>
        )}
      </div>
    </div>
  );
}