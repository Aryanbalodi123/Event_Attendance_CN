'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { IEvent } from '@/lib/types';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
const ModalAny = Modal as unknown as React.ComponentType<any>;
import CreateEventForm from '../forms/CreateEventForm';
import { Plus, Trash2, Calendar, MapPin, ArrowRight, Filter } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type EventFilter = 'all' | 'upcoming' | 'today' | 'past';

// Enhanced EventCard with modern glassmorphism design
const EventCard: React.FC<{ event: IEvent; onDelete: (eventId: string) => void }> = ({ event, onDelete }) => {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this event?')) {
      onDelete(String(event._id));
    }
  };

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

  const formattedDate = event.date
    ? new Date(event.date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    : 'Invalid Date';

  const eventId = event._id ? String(event._id) : undefined;

  if (!eventId) {
    console.error('EventCard - Missing event ID!', event);
    return (
  <div className="bg-linear-to-br from-red-900/20 to-red-800/10 backdrop-blur-sm border border-red-500/30 rounded-3xl p-6">
        <p className="text-red-300 font-medium">⚠️ Error: Event missing ID</p>
        <pre className="text-xs text-red-400 mt-3 opacity-70">{JSON.stringify(event, null, 2)}</pre>
      </div>
    );
  }

  return (
    <Link href={`/admin/events/${eventId}`}>
  <div className="group relative bg-linear-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:shadow-orange-500/20 hover:border-orange-500/50 transition-all duration-300 cursor-pointer overflow-hidden">
        {/* Animated gradient overlay */}
  <div className="absolute inset-0 bg-linear-to-br from-orange-500/0 via-orange-500/0 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
        
        {/* Content */}
        <div className="relative z-10">
          {/* Header with title and delete button */}
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-orange-600 pr-2 leading-tight group-hover:from-orange-300 group-hover:to-orange-500 transition-all duration-300">
              {event.name}
            </h3>
            <button
              onClick={handleDeleteClick}
              className="shrink-0 p-2.5 text-red-400/70 hover:text-red-300 bg-red-900/20 hover:bg-red-900/40 rounded-xl hover:scale-110 transition-all duration-200 backdrop-blur-sm border border-red-500/20 hover:border-red-500/40"
              title="Delete event"
              aria-label="Delete event"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Date section */}
          <div className="flex items-center gap-2.5 mb-3 text-gray-300 group-hover:text-orange-200 transition-colors duration-300">
            <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors duration-300">
              <Calendar className="h-4 w-4 text-orange-400" />
            </div>
            <p className="text-sm font-medium">{formattedDate}</p>
          </div>

          {/* Location section */}
          <div className="flex items-center gap-2.5 mb-4 text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
            <div className="p-2 bg-gray-700/30 rounded-lg group-hover:bg-gray-700/50 transition-colors duration-300">
              <MapPin className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-sm font-medium">{event.location}</p>
          </div>

          {/* View details button */}
          <div className="flex items-center gap-2 text-orange-400 group-hover:text-orange-300 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">
            <span>View Details</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>

        {/* Decorative corner accent */}
  <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-orange-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </Link>
  );
};

// Filter Button Component
const FilterButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  count: number;
}> = ({ label, isActive, onClick, count }) => (
  <button
    onClick={onClick}
    className={`
      relative px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 text-sm
      ${isActive 
  ? 'bg-linear-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 scale-105' 
        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/80 hover:text-gray-300 border border-gray-700/50'
      }
    `}
  >
    <span className="flex items-center gap-2">
      {label}
      <span className={`
        px-2 py-0.5 rounded-full text-xs font-bold
        ${isActive 
          ? 'bg-white/20 text-white' 
          : 'bg-gray-700/50 text-gray-500'
        }
      `}>
        {count}
      </span>
    </span>
  </button>
);

interface EventListProps {
  initialEvents: IEvent[];
}


const EventList: React.FC<EventListProps> = ({ initialEvents }) => {
  const [events, setEvents] = useState<IEvent[]>(initialEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<EventFilter>('all');
  const [search, setSearch] = useState('');
  const router = useRouter();

  // Function to categorize event based on date
  const categorizeEvent = (eventDate: string): EventFilter => {
    const now = new Date();
    const date = new Date(eventDate);
    // Remove time component for date comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (eventDay.getTime() === today.getTime()) return 'today';
    if (eventDay < today) return 'past';
    return 'upcoming';
  };

  // Filter and count events
  const { filteredEvents, counts } = useMemo(() => {
    const counts = {
      all: 0,
      upcoming: 0,
      today: 0,
      past: 0
    };
    // Filter by search first
    const searchLower = search.trim().toLowerCase();
    const filteredBySearch = events.filter(event =>
      !searchLower || (event.name && event.name.toLowerCase().includes(searchLower))
    );
    filteredBySearch.forEach(event => {
      if (event.date) {
        const category = categorizeEvent(String(event.date));
        counts[category]++;
      }
      counts.all++;
    });
    const filtered = filteredBySearch.filter(event => {
      if (!event.date) return activeFilter === 'all';
      const category = categorizeEvent(String(event.date));
      return activeFilter === 'all' || category === activeFilter;
    });
    return { filteredEvents: filtered, counts };
  }, [events, activeFilter, search]);

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete event');
      }
      setEvents(events.filter(event => String(event._id) !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  const handleEventCreated = (newEvent: IEvent) => {
    setEvents([newEvent, ...events]);
    setIsModalOpen(false);
    if (newEvent._id) {
      router.push(`/admin/events/${String(newEvent._id)}`);
    } else {
      console.error('New event missing ID after creation!', newEvent);
    }
  };

  return (
  <div className="font-['Poppins',sans-serif] min-h-screen w-full bg-black bg-linear-to-br from-black via-gray-900 to-black px-2 sm:px-4 md:px-8 py-4 md:py-8 flex flex-col items-center justify-start">
      <div className="w-full max-w-7xl">
        {/* Header section with Create Event button */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            {/* Search bar */}
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search events by name..."
              className="w-full sm:w-80 px-4 py-2 rounded-xl border border-gray-700 bg-gray-900 text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 mb-2 sm:mb-0"
              aria-label="Search events"
            />
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="group relative px-6 py-3 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105"
          >
            <span className="flex items-center gap-2">
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              Create Event
            </span>
          </Button>
        </div>

        {/* Filter Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Filter className="h-5 w-5 text-orange-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-200">Filter Events</h2>
          </div>
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3">
            <FilterButton
              label="All Events"
              isActive={activeFilter === 'all'}
              onClick={() => setActiveFilter('all')}
              count={counts.all}
            />
            <FilterButton
              label="Upcoming"
              isActive={activeFilter === 'upcoming'}
              onClick={() => setActiveFilter('upcoming')}
              count={counts.upcoming}
            />
            <FilterButton
              label="Today"
              isActive={activeFilter === 'today'}
              onClick={() => setActiveFilter('today')}
              count={counts.today}
            />
            <FilterButton
              label="Past"
              isActive={activeFilter === 'past'}
              onClick={() => setActiveFilter('past')}
              count={counts.past}
            />
          </div>
        </div>

        {/* Events grid or empty state */}
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full" />
              <div className="relative bg-linear-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 sm:p-12 text-center shadow-2xl w-full max-w-lg mx-auto">
                <div className="inline-flex p-4 bg-orange-500/10 rounded-2xl mb-6">
                  <Calendar className="h-12 w-12 text-orange-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-200 mb-3">
                  {activeFilter === 'all' ? 'No Events Yet' : `No ${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Events`}
                </h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto font-medium">
                  {activeFilter === 'all' 
                    ? 'Get started by creating your first event. Click the button above to begin!'
                    : `There are no ${activeFilter} events at the moment. Try a different filter or create a new event.`
                  }
                </p>
                <div className="inline-flex items-center gap-2 text-orange-400 text-sm font-semibold">
                  <span>Ready to create?</span>
                  <ArrowRight className="h-4 w-4 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, idx) => {
              const key = event._id ? String(event._id) : `missing-id-${event.name ?? idx}`;
              if (!event._id) {
                console.warn('Event missing _id in EventList map:', event);
              }
              return <EventCard key={key} event={event} onDelete={handleDeleteEvent} />;
            })}
          </div>
        )}
      </div>
      <ModalAny
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Event"
      >
        <CreateEventForm
          onSuccess={handleEventCreated}
          onClose={() => setIsModalOpen(false)}
        />
      </ModalAny>
    </div>
  );
};

export default EventList;