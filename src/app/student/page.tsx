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
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    document.body.style.fontFamily = "'Inter', sans-serif";
    
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
        // 2. Not found? Create one using session data (now includes rollNumber)
        const createRes = await fetch('/api/participants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: session.name,
            email: session.email,
            rollNumber: session.rollNumber,
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
  <div className="dark min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-gray-300 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-linear-to-br from-orange-500/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-linear-to-tl from-blue-500/5 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="text-center space-y-6 z-10">
          <div className="relative">
            <div className="w-20 h-20 mx-auto bg-linear-to-br from-orange-500/20 to-orange-600/20 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-orange-500/20 shadow-2xl shadow-orange-500/10">
              <Spinner size={40} />
            </div>
            <div className="absolute inset-0 bg-linear-to-br from-orange-500/20 to-orange-600/20 rounded-2xl blur-xl animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-gray-200 animate-pulse">Loading your session</p>
            <p className="text-sm text-gray-500">Please wait a moment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
  <div className="dark min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-gray-300 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-2xl p-10 rounded-3xl border border-red-500/20 shadow-2xl max-w-md w-full text-center space-y-6 z-10 relative">
          <div className="relative">
            <div className="w-24 h-24 bg-linear-to-br from-red-500/20 to-red-600/20 rounded-3xl flex items-center justify-center mx-auto backdrop-blur-xl border border-red-500/30 shadow-2xl">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="absolute inset-0 bg-linear-to-br from-red-500/20 to-red-600/20 rounded-3xl blur-2xl animate-pulse"></div>
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold bg-linear-to-r from-red-400 to-red-600 bg-clip-text text-transparent">Session Expired</h2>
            <p className="text-gray-400 leading-relaxed">Your session has expired. Please log in again to continue your journey.</p>
          </div>
          <Button onClick={() => window.location.href = '/login'} className="w-full h-12 text-base font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300">
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
  <div className="dark min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-gray-300 flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-2xl z-10">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-8 bg-slate-900/60 backdrop-blur-xl p-5 rounded-2xl border border-slate-800/50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 bg-linear-to-br from-orange-500 via-orange-600 to-orange-700 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/30">
                {session?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 shadow-lg"></div>
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-gray-200">{session?.name}</p>
              <p className="text-xs text-gray-500 flex items-center space-x-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span>{session?.email}</span>
              </p>
            </div>
          </div>
          <SignOutButton />
        </div>

        {!participant ? (
          <form
            onSubmit={handleRegister}
            className="bg-slate-900/60 backdrop-blur-2xl p-8 md:p-12 rounded-3xl border border-slate-800/50 shadow-2xl space-y-8 hover:shadow-orange-500/5 transition-all duration-500"
          >
            {/* Enhanced Hero Section */}
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-linear-to-br from-orange-500 via-orange-600 to-orange-700 rounded-3xl shadow-2xl shadow-orange-500/30 relative z-10 group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-linear-to-br from-orange-500 to-orange-700 rounded-3xl blur-2xl opacity-40 animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <h1 className="text-5xl font-black bg-linear-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent leading-tight">
                  Welcome Back!
                </h1>
                <p className="text-gray-400 text-lg font-medium max-w-md mx-auto leading-relaxed">
                  Select an event to activate your check-in scanner and start managing attendance
                </p>
              </div>
            </div>

            {/* Enhanced Event Selection */}
            <div className="space-y-5">
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

              {/* Enhanced Event Preview Card */}
              {selectedEventId && (
                <div className="relative group">
                  <div className="absolute inset-0 bg-linear-to-br from-orange-500/20 to-orange-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative bg-linear-to-br from-orange-500/10 via-orange-600/5 to-transparent border border-orange-500/30 rounded-2xl p-6 space-y-3 transform group-hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-orange-400 uppercase tracking-widest">Selected Event</p>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                    </div>
                    <p className="text-white font-bold text-2xl leading-tight">{getEventName(selectedEventId)}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-400 pt-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-slate-800/50 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="font-medium">{new Date(getEventDetails(selectedEventId)?.date || '').toLocaleDateString('en-US', { 
                          weekday: 'short',
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Error Message */}
            {error && (
              <div className="relative group">
                <div className="absolute inset-0 bg-red-500/20 rounded-2xl blur-xl"></div>
                <div className="relative bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex items-start space-x-4 backdrop-blur-sm">
                  <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-red-400 font-medium leading-relaxed">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Submit Button */}
            <Button 
              type="submit" 
              variant="primary" 
              className="w-full h-16 text-lg font-bold shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 rounded-2xl relative overflow-hidden group" 
              disabled={isLoading || !selectedEventId}
            >
              <div className="absolute inset-0 bg-linear-to-r from-orange-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {isLoading ? (
                <div className="flex items-center justify-center space-x-3 relative z-10">
                  <Spinner size={24} />
                  <span>Activating Scanner...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3 relative z-10">
                  <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <span>Activate Scanner</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              )}
            </Button>
          </form>
        ) : (
          <div className="bg-slate-900/60 backdrop-blur-2xl p-8 md:p-12 rounded-3xl border border-slate-800/50 shadow-2xl space-y-8">
            {/* Enhanced Scanner Header */}
            <div className="text-center space-y-5 pb-8 border-b border-slate-800/50">
              <div className="relative inline-block">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-green-500 via-green-600 to-emerald-600 rounded-3xl shadow-2xl shadow-green-500/30 relative z-10">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-linear-to-br from-green-500 to-emerald-600 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>
                {/* Pulse rings */}
                <div className="absolute inset-0 bg-green-500/30 rounded-full animate-ping"></div>
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  Scanner Active
                </h1>
                <div className="inline-block relative group">
                  <div className="absolute inset-0 bg-orange-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/40 rounded-2xl px-6 py-3 backdrop-blur-sm">
                    <p className="text-orange-400 font-bold text-lg flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                      <span>{getEventName(participant.eventId ? String(participant.eventId) : '')}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Scanner Component */}
            <div className="space-y-6">
              <StudentEventScanner
                participantId={participant._id ? String(participant._id) : ''}
                participantName={participant.name}
                email={participant.email}
                rollNumber={participant.rollNumber}
                eventId={String(participant.eventId)}
              />
            </div>

            {/* Enhanced Info Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-slate-700/50 rounded-2xl p-6 space-y-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Participant Info</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                    <span className="text-xs font-semibold text-green-500">Active</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                      {participant.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-lg">{participant.name}</p>
                      <p className="text-sm text-gray-400 flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <span>{participant.email || session?.email}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-700/50">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    <p className="text-xs text-gray-500 font-mono">ID: {participant._id ? String(participant._id).slice(-12) : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Back Button */}
            <Button 
              onClick={handleBackToSelection}
              variant="secondary" 
              className="w-full h-14 font-semibold rounded-2xl group hover:bg-slate-800/80 transition-all duration-300"
            >
              <div className="flex items-center justify-center space-x-3">
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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