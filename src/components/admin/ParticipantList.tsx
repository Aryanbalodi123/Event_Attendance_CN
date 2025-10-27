'use client';

// Removed useEffect as it's not strictly needed after cleaning up state init
import React, { useState, useMemo } from 'react';
import { IEvent, IParticipant } from '@/lib/types';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
// Removed ScanQrCode import
import { Plus, CheckCircle, XCircle } from 'lucide-react';
import AddParticipantForm from '../forms/AddParticipantForm';
// Removed the incorrect scanner import
// import QrScanner from '../student/StudentEventScanner';

// Helper function to check if a participant object is fully populated
function isParticipantPopulated(p: IParticipant | import('mongoose').Types.ObjectId | string): p is IParticipant {
  return typeof p === 'object' && p !== null && '_id' in p;
}


const ParticipantList: React.FC<{ event: IEvent }> = ({ event }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // Removed isScanModalOpen state
  // Removed verificationMessage state

  // Derive participants from the event prop (immutable source) and keep a local list for newly added participants
  const derivedParticipants = useMemo(() => {
    if (Array.isArray(event.participants)) {
      return event.participants.filter(isParticipantPopulated);
    }
    return [] as IParticipant[];
  }, [event.participants]);

  // Local additions that are appended on top of derivedParticipants
  const [localParticipants, setLocalParticipants] = useState<IParticipant[]>([]);

  const participants = useMemo(() => {
    return [...derivedParticipants, ...localParticipants];
  }, [derivedParticipants, localParticipants]);

  const handleParticipantAdded = (newParticipant: IParticipant) => {
    setLocalParticipants(current => [...current, newParticipant]);
    setIsAddModalOpen(false);
  };

  // Removed handleScanSuccess function

  const eventIdString = event._id ? String(event._id) : undefined;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <h2 className="text-2xl font-semibold text-white">Participants ({participants.length})</h2>
        {/* Removed verificationMessage display */}
        {/* Simplified button group */}
        <div className="flex gap-2">
          {/* REMOVED Scan Button */}
          {/* Add Participant Button */}
          <Button onClick={() => setIsAddModalOpen(true)} disabled={!eventIdString}>
            <Plus size={18} className="inline mr-1" />
            Add Participant
          </Button>
        </div>
      </div>

      <div className="flow-root">
        <ul role="list" className="divide-y divide-gray-800">
          {participants.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No participants added yet or data is not fully loaded.</p>
            ) : (
            participants.map((participant, idx) => {
              const key = participant._id ? String(participant._id) : `missing-id-${participant.email ?? idx}`;
              if (!participant._id) {
                console.warn('Participant missing _id in ParticipantList map:', participant);
              }
              return (
                <li key={key} className="py-3 flex justify-between items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{participant.name}</p>
                    <p className="text-sm text-gray-400 truncate">{participant.email}</p>
                  </div>
                  <div className="shrink-0">
                    {participant.attended ? (
                      <span className="flex items-center text-xs text-green-400">
                        <CheckCircle size={14} className="mr-1 shrink-0" /> Attended
                      </span>
                    ) : (
                      <span className="flex items-center text-xs text-gray-500">
                        <XCircle size={14} className="mr-1 shrink-0" /> Not Attended
                      </span>
                    )}
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>

      {/* Add Participant Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Participant"
      >
        {eventIdString ? (
          <AddParticipantForm
            eventId={eventIdString}
            onSuccess={handleParticipantAdded}
            onClose={() => setIsAddModalOpen(false)}
          />
        ) : (
          <p className="text-red-500 text-center">Event ID is missing. Cannot load form.</p>
        )}
      </Modal>

      {/* REMOVED Scan QR Modal */}

    </div>
  );
};

export default ParticipantList;