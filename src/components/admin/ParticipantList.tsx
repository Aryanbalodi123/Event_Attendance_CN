'use client';

import React, { useState } from 'react';
import { IEvent, IParticipant } from '@/lib/types';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { Plus, CheckCircle, XCircle, ScanQrCode } from 'lucide-react'; // Import ScanQrCode
import AddParticipantForm from '../forms/AddParticipantForm';
import QrScanner from './QrScanner'; // Import the new scanner component

const ParticipantList: React.FC<{ event: IEvent }> = ({ event }) => {
  const [participants, setParticipants] = useState<IParticipant[]>(event.participants as any[] || []);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false); // State for scanner modal
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);

  const handleParticipantAdded = (newParticipant: IParticipant) => {
    setParticipants([...participants, newParticipant]);
  };

  // CONFIRMATION 3: This function runs on successful scan
  const handleScanSuccess = (updatedParticipant: IParticipant) => {
    // Find and update the participant in our local state
    setParticipants(currentParticipants =>
      currentParticipants.map(p =>
        p._id === updatedParticipant._id ? updatedParticipant : p
      )
    );
    // The modal will show its own success message.
    // The list will now be updated in the background.
    // Show a brief verification message in the list UI
    setVerificationMessage('Verified');
    setTimeout(() => setVerificationMessage(null), 3000);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <h2 className="text-2xl font-semibold text-white">Participants ({participants.length})</h2>
        {verificationMessage && (
          <div className="ml-4 inline-flex items-center gap-2 rounded-lg bg-green-900/60 text-green-300 px-3 py-1">
            <CheckCircle size={16} />
            <span className="text-sm font-medium">{verificationMessage}</span>
          </div>
        )}
        <div className="flex gap-2">
          {/* Scan Button */}
          <Button onClick={() => setIsScanModalOpen(true)} variant="secondary">
            <ScanQrCode size={18} className="inline mr-1" />
            Scan QR
          </Button>
          {/* Add Participant Button */}
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus size={18} className="inline mr-1" />
            Add Participant
          </Button>
        </div>
      </div>

      <div className="flow-root">
        <ul role="list" className="divide-y divide-gray-800">
          {participants.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No participants added yet.</p>
          ) : (
            participants.map((participant) => (
              // FIX 1: Convert _id to string for the 'key' prop
              <li key={participant._id?.toString() ?? 'temp-' + Math.random()} className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-white">{participant.name}</p>
                  <p className="text-sm text-gray-400">{participant.email}</p>
                </div>
                {/* This will now update live after a scan */}
                {participant.attended ? (
                  <span className="flex items-center text-xs text-green-400">
                    <CheckCircle size={14} className="mr-1" /> Attended
                  </span>
                ) : (
                  <span className="flex items-center text-xs text-gray-500">
                    <XCircle size={14} className="mr-1" /> Not Attended
                  </span>
                )}
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Add Participant Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Participant"
      >
        {/* FIX 2: Conditionally render the form only if event._id exists.
          This prevents 'undefined' from being passed as a prop.
        */}
        {event._id ? (
          <AddParticipantForm
            eventId={event._id.toString()}
            onSuccess={handleParticipantAdded}
            onClose={() => setIsAddModalOpen(false)}
          />
        ) : (
          <p className="text-red-500 text-center">Event ID is missing. Cannot load form.</p>
        )}
      </Modal>

      {/* Scan QR Modal */}
      <Modal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        title="Scan Participant QR Code"
      >
        {event._id ? (
          <QrScanner
            // Convert the ID to a string to satisfy the prop type
            eventId={event._id.toString()}
            onSuccess={handleScanSuccess}
          />
        ) : (
          // Show an error if the ID is missing for some reason
          <p className="text-red-500 text-center">Event ID is missing. Cannot load scanner.</p>
        )}
      </Modal>
    </div>
  );
};

export default ParticipantList;

