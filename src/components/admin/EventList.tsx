'use client';

// FIX: Removed useState and useEffect imports as they are no longer needed in EventCard
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
  // FIX: Removed useState and useEffect for formattedDate
  // const [formattedDate, setFormattedDate] = useState<string>('');
  // useEffect(() => { ... }, [event.date]);

  // FIX: Format the date directly here for rendering
  const formattedDate = event.date
    ? new Date(event.date).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    : 'Invalid Date'; // Fallback if date is missing or invalid

  // Ensure eventId is always a string for rendering and routing
  // Convert ObjectId if necessary
  const eventId = event._id ? String(event._id) : undefined;

  if (!eventId) {
    console.error('EventCard - Missing event ID!', event);
    return (
      <div className="bg-red-900 border border-red-800 rounded-2xl p-4">
        <p className="text-red-300">Error: Event missing ID</p>
        {/* Optionally display more event data for debugging */}
        <pre className="text-xs text-red-400 mt-2">{JSON.stringify(event, null, 2)}</pre>
      </div>
    );
  }

  return (
    // Use the guaranteed string eventId for the link
    <Link href={`/admin/events/${eventId}`}>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-lg hover:shadow-orange-500/10 hover:border-orange-500 transition-all duration-200 cursor-pointer">
        <h3 className="text-xl font-semibold text-orange-500 mb-2">{event.name}</h3>
        {/* Render the directly formatted date */}
        <p className="text-gray-400">{formattedDate}</p>
        <p className="text-gray-500">{event.location}</p>
        {/* Removed debug ID display */}
        {/* <p className="text-xs text-gray-600 mt-2">ID: {eventId}</p> */}
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

  // Debug: Log initial events (keep if helpful)
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
       // Convert ObjectId to string for URL
      router.push(`/admin/events/${String(newEvent._id)}`);
    } else {
      console.error('New event missing ID after creation!', newEvent);
      // Optionally show a user-facing error message here
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
          {events.map((event, idx) => {
            // FIX: Use String(event._id) directly as the key.
            // Ensure event._id exists; if not, there's a bigger data issue.
            // Use stable fallback that doesn't call impure functions during render.
            const key = event._id ? String(event._id) : `missing-id-${event.name ?? idx}`; // Last resort fallback uses index
            if (!event._id) {
                console.warn('Event missing _id in EventList map:', event);
            }
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