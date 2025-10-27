// src/components/forms/AddParticipantForm.tsx
'use client';

import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { IParticipant } from '@lib/types';

interface AddParticipantFormProps {
  eventId: string;
  onSuccess: (newParticipant: IParticipant) => void;
  onClose: () => void;
}

const AddParticipantForm: React.FC<AddParticipantFormProps> = ({ eventId, onSuccess, onClose }) => {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Input
        id="name"
        label="Participant Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        id="email"
        label="Participant Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add Participant'}
        </Button>
      </div>
    </form>
  );
};

export default AddParticipantForm;