'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { IEvent, IParticipant } from '@/lib/types'
import Modal from '../ui/Modal'
import { Plus, Trash2, Loader, Search } from 'lucide-react'
import AddParticipantForm from '../forms/AddParticipantForm'

// Helper: ensure participant object
function isParticipantPopulated(
  p: IParticipant | import('mongoose').Types.ObjectId | string
): p is IParticipant {
  return typeof p === 'object' && p !== null && '_id' in p
}

const ParticipantList: React.FC<{ event: IEvent }> = ({ event }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoadingDelete, setIsLoadingDelete] = useState<string | null>(null)

  const derivedParticipants = useMemo(() => {
    if (Array.isArray(event.participants)) {
      return event.participants
        .filter(isParticipantPopulated)
        .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
    }
    return [] as IParticipant[]
  }, [event.participants])

  const [visibleParticipants, setVisibleParticipants] =
    useState<IParticipant[]>(derivedParticipants)

  useEffect(() => {
    setVisibleParticipants(derivedParticipants)
  }, [derivedParticipants])

  const filteredParticipants = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return visibleParticipants
    return visibleParticipants.filter(
      (p) =>
        (p.name ?? '').toLowerCase().includes(q) ||
        (p.email ?? '').toLowerCase().includes(q) ||
        (p.rollNumber ?? '').toLowerCase().includes(q)
    )
  }, [visibleParticipants, searchQuery])

  const handleParticipantAdded = (newParticipant: IParticipant) => {
    setVisibleParticipants((cur) =>
      [...cur, newParticipant].sort((a, b) =>
        (a.name ?? '').localeCompare(b.name ?? '')
      )
    )
    setIsAddModalOpen(false)
  }

  const handleDelete = async (participantId: string) => {
    if (!participantId) return
    setIsLoadingDelete(participantId)
    try {
      const res = await fetch(`/api/participants?id=${participantId}`, {
        method: 'DELETE',
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error || 'Failed to delete')
      setVisibleParticipants((cur) =>
        cur.filter((p) => String(p._id) !== participantId)
      )
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoadingDelete(null)
    }
  }

  const eventIdString = event._id ? String(event._id) : undefined

  const maxListHeight = 'calc(100vh - 260px)'

  return (
    <div className="flex flex-col h-full min-h-0 min-w-0">
      {/* Header */}
      <div className="flex-shrink-0 flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-200">
          Attendees ({filteredParticipants.length})
        </h2>

        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:flex-auto min-w-0">
            <input
              type="text"
              placeholder="Search by name, email, roll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900/70 text-white border-2 border-slate-700 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/50 transition-all"
            />
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            disabled={!eventIdString}
            className="flex-shrink-0 px-5 py-2.5 bg-orange-500 text-black border-2 border-orange-600 rounded-lg font-semibold hover:bg-orange-600 hover:border-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/30 flex items-center gap-2"
          >
            <Plus size={18} />
            Add
          </button>
        </div>
      </div>

      {/* ===== Scrollable Table ===== */}
      <div
        className="flex-1 min-h-0 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-md shadow-inner custom-scrollbar"
        style={{ maxHeight: maxListHeight }}
      >
        {filteredParticipants.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            {searchQuery ? 'No attendees found.' : 'No attendees registered.'}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-800 text-sm text-gray-200">
            <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-md z-10">
              <tr className="text-left text-gray-400 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 font-medium w-12">#</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Roll Number</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredParticipants.map((participant, index) => {
                const pId = String(participant._id)
                return (
                  <tr
                    key={pId}
                    className="hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 font-medium">
                      {participant.name ?? 'No Name'}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {participant.email ?? 'No Email'}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {participant.rollNumber ?? 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      {participant.attended ? (
                        <span className="inline-flex items-center rounded-md bg-green-900/40 px-2 py-1 text-xs font-medium text-green-400 ring-1 ring-inset ring-green-500/20">
                          Attended
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-gray-800/40 px-2 py-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-gray-600/20">
                          Not Attended
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(pId)}
                        disabled={isLoadingDelete === pId}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-all disabled:opacity-50"
                        aria-label="Delete"
                      >
                        {isLoadingDelete === pId ? (
                          <Loader size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title=""
      >
        {eventIdString ? (
          <AddParticipantForm
            eventId={eventIdString}
            onSuccess={handleParticipantAdded}
            onClose={() => setIsAddModalOpen(false)}
          />
        ) : (
          <p className="text-red-500 text-center">
            Event ID missing. Cannot load form.
          </p>
        )}
      </Modal>

      {/* Scrollbar styling */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #f97316aa, #f97316cc);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #fb923c, #f97316);
        }
      `}</style>
    </div>
  )
}

export default ParticipantList
