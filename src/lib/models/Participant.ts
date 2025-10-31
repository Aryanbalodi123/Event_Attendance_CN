// lib/models/Participant.ts
import mongoose from 'mongoose';
import { IParticipant } from '../types';

const ParticipantSchema = new mongoose.Schema<IParticipant>(
  {
    name: {
      type: String,
      required: [true, 'Participant name is required.'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Participant email is required.'],
      trim: true,
      lowercase: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required.'],
      trim: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required.'],
    },
    attended: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// 💡 --- ADD THIS LINE --- 💡
// This tells MongoDB: A rollNumber can only appear ONCE per eventId.
// This is the "compound index" we talked about.
ParticipantSchema.index({ eventId: 1, rollNumber: 1 }, { unique: true });
// 💡 ------------------------- 💡

// Only create the model if it doesn't exist
const Participant = mongoose.models.Participant || mongoose.model<IParticipant>('Participant', ParticipantSchema);

export default Participant;