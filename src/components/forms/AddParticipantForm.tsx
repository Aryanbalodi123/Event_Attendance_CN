// src/components/forms/AddParticipantForm.tsx
'use client';

import React, { useState } from 'react';
import { IParticipant } from '@lib/types';
import Button from '../ui/Button';
import Input from '../ui/Input';

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

    try {
      const res = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, eventId }),
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error);

      onSuccess(result.data);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto  rounded-2xl shadow-md p-6 space-y-5"
    >
  

      {error && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-md">
          {error}
        </p>
      )}

      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label
            htmlFor="name"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Participant Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Enter full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 
                       bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 
                       focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Participant Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 
                       bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 
                       focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 
                     border border-gray-300 dark:border-gray-600 hover:bg-gray-100 
                     dark:hover:bg-neutral-800 transition-all"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 
                     text-white font-medium transition-all"
        >
          {isLoading ? 'Adding...' : 'Add Participant'}
        </Button>
      </div>
    </form>
  );
};

export default AddParticipantForm;
