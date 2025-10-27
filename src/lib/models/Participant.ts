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

// Only create the model if it doesn't exist
const Participant = mongoose.models.Participant || mongoose.model<IParticipant>('Participant', ParticipantSchema);

export default Participant;