'use client';

import React, { useState, useEffect } from 'react';
import { IEvent, IParticipant } from '@/lib/types';
import Button from '@/components/ui/Button';
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
          if (data.data.length > 0) {
            setSelectedEventId(String(data.data[0]._id));
          }
        }
      } catch (err) {
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
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventName = (id: string) => {
    return allEvents.find(event => String(event._id) === id)?.name || 'Event';
  };

  if (isSessionLoading) {
    return (
      <div className="dark min-h-screen bg-black text-gray-300 flex items-center justify-center p-4">
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-black text-gray-300 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
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
            >
              {allEvents.length === 0 ? (
                <option>Loading events...</option>
              ) : (
                allEvents.map((event) => (
                  <option key={String(event._id)} value={String(event._id)}>
                    {event.name} ({new Date(event.date).toLocaleDateString()})
                  </option>
                ))
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
              Scan for: {getEventName(String(participant.eventId))}
            </h1>
            <p className="text-center text-orange-500 text-lg mb-6">
              Logged in as: {session?.name}
            </p>
            <StudentEventScanner
              participantId={String(participant._id)}
              participantName={participant.name}
            />
          </div>
        )}
      </div>
    </div>
  );
}