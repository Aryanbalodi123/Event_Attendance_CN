// src/components/forms/CreateEventForm.tsx
'use client';

import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { IEvent } from '@lib/types';

interface CreateEventFormProps {
  onSuccess: (newEvent: IEvent) => void;
  onClose: () => void;
}

const CreateEventForm: React.FC<CreateEventFormProps> = ({ onSuccess, onClose }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!name || !date || !location) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, date, location }),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create event');
      }

      onSuccess(result.data); // Pass the new event data back
      onClose(); // Close the modal

    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900/80 rounded-2xl shadow-lg p-2 sm:p-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-lg font-bold text-white mb-2 tracking-tight text-center">Create New Event</h2>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div className="grid grid-cols-1 gap-5">
          <Input
            id="name"
            label="Event Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            id="date"
            label="Date & Time"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <Input
            id="location"
            label="Location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Event'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventForm;