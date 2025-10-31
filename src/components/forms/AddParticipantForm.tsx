'use client';

import React, { useState } from 'react';
import { IParticipant } from '@/lib/types';
// ⛔️ DO NOT import 'mongoose' in a client component. It's a server library.
// import { Types } from 'mongoose'; 


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
  const [rollNumber, setRollNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // 1. Check for empty fields
    if (!name || !email || !rollNumber) {
      setError('Name, Email, and Roll Number are required.');
      setIsLoading(false);
      return;
    }

    // 2. Check Roll Number format (must be 10 digits)
    const rollNumberRegex = /^\d{10}$/;
    if (!rollNumberRegex.test(rollNumber)) {
      setError('Roll Number must be exactly 10 digits.');
      setIsLoading(false);
      return;
    }

    // 3. Check Email format (must be @chitkara.edu.in)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@chitkara\.edu\.in$/;
    if (!emailRegex.test(email.toLowerCase())) {
      setError('Email must be a valid @chitkara.edu.in address.');
      setIsLoading(false);
      return;
    }
    
    try {
      const res = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email, 
          rollNumber, 
          eventId: eventId // ✅ FIX 2: Just send the eventId string.
        }),
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to add participant');
      }

      // ✅ FIX 1: Your API returns 'result.data', not 'result.participant'
      if (result.data) {
        onSuccess(result.data); 
        onClose();
      } else {
        // This case should ideally not happen if success is true,
        // but it's good practice to be defensive.
        throw new Error('API returned success but no participant data.');
      }

    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div className="glass-modal glass-modal-centered shadow-2xl p-6 sm:p-8 border-2 border-orange-500 w-full max-w-md mx-auto frosted-glass">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-b-2 border-orange-500 pb-4">
          <h2 className="text-2xl font-bold text-orange-500 tracking-tight text-center">
            Register New Attendee
          </h2>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-3">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
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
              disabled={isLoading}
              className="w-full bg-gray-900 text-white border-2 border-orange-500 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/50 transition-all"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label htmlFor="rollNumber" className="block text-orange-400 text-sm font-semibold mb-2">
              Roll Number (10 digits)
            </label>
            <input
              id="rollNumber"
              type="text" // Use text to allow leading zeros, regex handles validation
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              required
              disabled={isLoading}
              maxLength={10} // Good UX to prevent typing more than 10
              className="w-full bg-gray-900 text-white border-2 border-orange-500 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/50 transition-all"
              placeholder="Enter 10-digit roll number"
            />
          </div>

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
              disabled={isLoading}
              className="w-full bg-gray-90Videos0 text-white border-2 border-orange-500 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/50 transition-all"
              placeholder="username@chitkara.edu.in"
            />
          </div>
        </div>

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
            {isLoading ? 'Registering...' : 'Register Attendee'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddParticipantForm;