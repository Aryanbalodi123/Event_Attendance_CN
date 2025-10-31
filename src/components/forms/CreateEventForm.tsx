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

      onSuccess(result.data);
      onClose();

    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div className="glass-modal glass-modal-centered shadow-2xl p-6 sm:p-8 border-2 border-orange-500 frosted-glass">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header with orange accent */}
        <div className="border-b-2 border-orange-500 pb-4">
          <h2 className="text-2xl font-bold text-orange-500 tracking-tight text-center">
            Create New Event
          </h2>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-3">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Form inputs with enhanced styling */}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="name" className="block text-orange-400 text-sm font-semibold mb-2">
              Event Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-gray-900 text-white border-2 border-orange-500 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/50 transition-all"
              placeholder="Enter event name"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-orange-400 text-sm font-semibold mb-2">
              Date & Time
            </label>
            <input
              id="date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full bg-gray-900 text-white border-2 border-orange-500 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/50 transition-all"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-orange-400 text-sm font-semibold mb-2">
              Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="w-full bg-gray-900 text-white border-2 border-orange-500 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/50 transition-all"
              placeholder="Enter event location"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-3 bg-gray-800 text-white border-2 border-gray-600 rounded-lg font-semibold hover:bg-gray-700 hover:border-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-orange-500 text-black border-2 border-orange-600 rounded-lg font-semibold hover:bg-orange-600 hover:border-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/30"
          >
            {isLoading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventForm;