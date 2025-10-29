'use client';

import React, { useState } from 'react';
import { IParticipant } from '@lib/types';

// Note: This component uses raw <input> and <button> elements to match the
// styling of CreateEventForm, rather than the custom <Input> or <Button> components.

interface AddParticipantFormProps {
  eventId: string;
  onSuccess: (newParticipant: IParticipant) => void;
  onClose: () => void;
}

const AddParticipantForm: React.FC<AddParticipantFormProps> = ({
  eventId,
  onSuccess,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Added validation, similar to your CreateEventForm
    if (!name || !email) {
      setError('Name and Email are required.');
      setIsLoading(false);
      return;
    }
    
    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, eventId }),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to add participant');
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
    // Copied root style from CreateEventForm
    <div className="bg-black rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-orange-500">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header style from CreateEventForm, text updated */}
        <div className="border-b-2 border-orange-500 pb-4">
          <h2 className="text-2xl font-bold text-orange-500 tracking-tight text-center">
            Add New Participant
          </h2>
        </div>

        {/* Error message style from CreateEventForm */}
        {error && (
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-3">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Form inputs style from CreateEventForm */}
        <div className="grid grid-cols-1 gap-6">
          {/* Participant Name Input */}
          <div>
            <label htmlFor="name" className="block text-orange-400 text-sm font-semibold mb-2">
              Participant Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-gray-900 text-white border-2 border-orange-500 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/50 transition-all"
              placeholder="Enter full name"
            />
          </div>

          {/* Participant Email Input */}
          <div>
            <label htmlFor="email" className="block text-orange-400 text-sm font-semibold mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-900 text-white border-2 border-orange-500 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/50 transition-all"
              placeholder="example@email.com"
            />
          </div>
        </div>

        {/* Action buttons style from CreateEventForm */}
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
            {/* Text updated for participant context */}
            {isLoading ? 'Adding...' : 'Add Participant'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddParticipantForm;