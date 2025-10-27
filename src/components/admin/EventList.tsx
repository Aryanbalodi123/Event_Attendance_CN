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
const EventCard: React.FC<{ event: IEvent; onDelete: (eventId: string) => void }> = ({ event, onDelete }) => {
  // Handle delete click with event bubbling prevention
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this event?')) {
      onDelete(String(event._id));
    }
  };

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
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-lg hover:shadow-orange-500/10 hover:border-orange-500 transition-all duration-200 cursor-pointer relative">
        <h3 className="text-xl font-semibold text-orange-500 mb-2">{event.name}</h3>
        {/* Render the directly formatted date */}
        <p className="text-gray-400">{formattedDate}</p>
        <p className="text-gray-500">{event.location}</p>
        {/* Delete button positioned absolutely in top-right corner */}
        <button
          onClick={handleDeleteClick}
          className="absolute top-2 right-2 p-2 text-red-500 hover:text-red-400 bg-gray-800 rounded-full hover:bg-gray-700 transition-all"
          title="Delete event"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
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

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      // Remove the event from the local state
      setEvents(events.filter(event => String(event._id) !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

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
            return <EventCard key={key} event={event} onDelete={handleDeleteEvent} />;
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