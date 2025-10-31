'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { IEvent, IParticipant } from '@/lib/types'
import Modal from '../ui/Modal'
import { Plus, Trash2, Loader2, Search } from 'lucide-react'
import AddParticipantForm from '../forms/AddParticipantForm'

// Helper: ensure participant object
function isParticipantPopulated(
  p: IParticipant | import('mongoose').Types.ObjectId | string
): p is IParticipant {
  return typeof p === 'object' && p !== null && '_id' in p
}

// Mobile row component with swipe-to-delete behavior
function MobileRow({
  participant,
  index,
  onDelete,
  isLoading,
}: {
  participant: IParticipant
  index: number
  onDelete: (id: string) => void
  isLoading: string | null
}) {
  const [translate, setTranslate] = useState(0)
  const startX = React.useRef<number | null>(null)
  const openRef = React.useRef(false)
  const maxReveal = 100 // width for delete button reveal
  const pId = String(participant._id)

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX.current === null) return
    const currentX = e.touches[0].clientX
    const delta = currentX - startX.current
    
    // Add resistance to the swipe
    if (delta < 0) { // swiping left
      const resistance = 0.5 // higher = more resistance
      const resistedDelta = delta * resistance
      setTranslate(Math.max(resistedDelta, -maxReveal))
    } else {
      // Reset when swiping right
      setTranslate(0)
      openRef.current = false
    }
  }

  const handleTouchEnd = () => {
    // Require more deliberate swipe (2/3 of maxReveal)
    if (translate <= -(maxReveal * 0.66)) {
      setTranslate(-maxReveal)
      openRef.current = true
    } else {
      setTranslate(0)
      openRef.current = false
    }
    startX.current = null
  }

  return (
    <div className="relative w-full overflow-hidden">
      {/* Delete button behind the sliding content */}
      <div 
        className="absolute inset-y-0 right-0 flex items-center justify-center w-[100px] transition-opacity duration-200"
        style={{ opacity: translate < -20 ? Math.min(1, -translate/maxReveal) : 0 }}
      >
        <button
          onClick={() => onDelete(pId)}
          disabled={isLoading === pId}
          className="h-10 w-20 bg-red-600 text-white rounded-md flex items-center justify-center gap-2 font-medium shadow-sm"
          aria-label="Delete"
        >
          {isLoading === pId ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <>
              <Trash2 size={16} />
              Delete
            </>
          )}
        </button>
      </div>

      {/* Sliding card content */}
      <div
        className="bg-[#1e293b] rounded-lg px-3 py-2.5"
        style={{ 
          transform: `translateX(${translate}px)`, 
          transition: translate === 0 ? 'transform 150ms ease' : 'none'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-full flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-sm font-medium w-6">{index + 1}</span>
              <div className="min-w-0">
                <div className="font-medium text-gray-100 truncate">{participant.name ?? 'No Name'}</div>
                <div className="text-xs text-gray-400 truncate">{participant.email ?? 'No Email'}</div>
                <div className="text-xs text-gray-400 truncate">Roll: {participant.rollNumber ?? 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ParticipantList: React.FC<{ event: IEvent }> = ({ event }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoadingDelete, setIsLoadingDelete] = useState<string | null>(null)

  const derivedParticipants = useMemo(() => {
    if (Array.isArray(event.participants)) {
      return event.participants.filter(isParticipantPopulated)
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

  const handleParticipantAdded = async (newParticipant: IParticipant) => {
    // Check if roll number already exists
    if (newParticipant.rollNumber) {
      const existingParticipant = visibleParticipants.find(
        (p) => p.rollNumber?.toLowerCase() === newParticipant.rollNumber?.toLowerCase()
      )
      if (existingParticipant) {
        alert(`A participant with roll number ${newParticipant.rollNumber} already exists.`)
        return
      }
    }
    
    setVisibleParticipants((cur) => [...cur, newParticipant])
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

  const maxListHeight = 'calc(100vh - 320px)'

  return (
  <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="shrink-0 flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
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
            className="shrink-0 px-5 py-2.5 bg-orange-500 text-black border-2 border-orange-600 rounded-lg font-semibold hover:bg-orange-600 hover:border-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/30 flex items-center gap-2"
          >
            <Plus size={18} />
            Add
          </button>
        </div>
      </div>

  {/* ===== Scrollable Content ===== */}
  <div className="flex-1 min-h-0 rounded-xl border border-slate-800 bg-slate-800/30 shadow-inner">
        {filteredParticipants.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            {searchQuery ? 'No attendees found.' : 'No attendees registered.'}
          </div>
        ) : (
          <div className="relative w-full h-full">
            <div className="hidden md:grid grid-cols-[50px_1.5fr_2fr_1fr_100px] sticky top-0 bg-slate-900/90 backdrop-blur-md z-10 border-b border-slate-800 text-left text-gray-400 text-xs uppercase tracking-wide rounded-t-xl">
              <div className="px-4 py-3 font-medium" title="Serial Number">#</div>
              <div className="px-4 py-3 font-medium" title="Participant's Name">Name</div>
              <div className="px-4 py-3 font-medium" title="Participant's Email Address">Email</div>
              <div className="px-4 py-3 font-medium" title="Student Roll Number">Roll Number</div>
              <div className="px-4 py-3 font-medium text-center" title="Delete Participant">Action</div>
            </div>
            <div className="overflow-y-auto custom-scrollbar max-h-[calc(100vh-420px)] min-h-[300px] divide-y divide-slate-800">
              {filteredParticipants.map((participant, index) => {
                const pId = String(participant._id)
                return (
                  <div key={pId}>
                    {/* desktop view */}
                    <div className="hidden md:grid grid-cols-[50px_1.5fr_2fr_1fr_100px] hover:bg-slate-800/50 transition-colors text-sm items-center">
                      <div className="px-4 py-3 text-gray-500" title={`Entry #${index + 1}`}>{index + 1}</div>
                      <div className="px-4 py-3 font-medium truncate" title={participant.name ?? 'No Name'}>{participant.name ?? 'No Name'}</div>
                      <div className="px-4 py-3 text-gray-400 truncate" title={participant.email ?? 'No Email'}>{participant.email ?? 'No Email'}</div>
                      <div className="px-4 py-3 text-gray-400" title={participant.rollNumber ?? 'Not Available'}>{participant.rollNumber ?? 'N/A'}</div>
                      <div className="px-4 py-3 flex justify-center">
                        <button
                          onClick={() => handleDelete(pId)}
                          disabled={!!isLoadingDelete}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={isLoadingDelete === pId ? 'Deleting...' : 'Delete Participant'}
                        >
                          {isLoadingDelete === pId ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* mobile view */}
                    <div className="md:hidden px-2 py-2">
                      <MobileRow
                        participant={participant}
                        index={index}
                        onDelete={handleDelete}
                        isLoading={isLoadingDelete}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
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

      {/* Scrollbar styling and responsive table */}
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
        /* Mobile layout handled via responsive Tailwind classes; avoid forcing table->block here */
      `}</style>
    </div>
  )
}

export default ParticipantList
