'use client';

import React, { useState, useEffect } from 'react';
import { IEvent } from '@/lib/types';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import CreateEventForm from '../forms/CreateEventForm';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// A simple card for displaying event info
const EventCard: React.FC<{ event: IEvent }> = ({ event }) => {
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    // Format date only on client side to avoid hydration mismatch
    setFormattedDate(new Date(event.date).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }));
  }, [event.date]);

  // Debug: Log the event ID to make sure it exists
  console.log('EventCard - Event:', event);
  console.log('EventCard - Event ID:', event._id);

  // Ensure eventId is always a string for rendering and routing
  const eventId = typeof event._id === 'string' ? event._id : event._id ? String(event._id) : undefined;

  if (!eventId) {
    console.error('EventCard - Missing event ID!', event);
    return (
      <div className="bg-red-900 border border-red-800 rounded-2xl p-4">
        <p className="text-red-300">Error: Event missing ID</p>
      </div>
    );
  }

  return (
    <Link href={`/admin/events/${eventId}`}>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-lg hover:shadow-orange-500/10 hover:border-orange-500 transition-all duration-200 cursor-pointer">
        <h3 className="text-xl font-semibold text-orange-500 mb-2">{event.name}</h3>
        <p className="text-gray-400">{formattedDate || 'Loading date...'}</p>
        <p className="text-gray-500">{event.location}</p>
        {/* Debug info - remove this after fixing */}
        <p className="text-xs text-gray-600 mt-2">ID: {String(eventId)}</p>
      </div>
    </Link>
  );
};

// Define the EventListProps interface
interface EventListProps {
  initialEvents: IEvent[];
}

const EventList: React.FC<EventListProps> = ({ initialEvents }) => {
  const [events, setEvents] = useState<IEvent[]>(initialEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  // Debug: Log initial events
  useEffect(() => {
    console.log('EventList - Initial Events:', initialEvents);
  }, [initialEvents]);

  const handleEventCreated = (newEvent: IEvent) => {
    console.log('EventList - New event created:', newEvent);
    
    // Update local state
    setEvents([newEvent, ...events]);
    
    // Close modal
    setIsModalOpen(false);
    
    // Redirect to the new event's page
    if (newEvent._id) {
      router.push(`/admin/events/${newEvent._id}`);
    } else {
      console.error('New event missing ID!', newEvent);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={18} className="inline mr-1" />
          Create Event
        </Button>
      </div>

      {events.length === 0 ? (
        <p className="text-gray-500 text-center py-10">
          No events found. Create one to get started!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            // Ensure key is a stable string
            const key = event._id ? (typeof event._id === 'string' ? event._id : String(event._id)) : Math.random().toString();
            return <EventCard key={key} event={event} />;
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Event"
      >
        <CreateEventForm
          onSuccess={handleEventCreated}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default EventList;