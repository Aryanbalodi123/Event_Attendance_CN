import mongoose, { Schema, models, Model } from 'mongoose';
import { IEvent } from '../types';
import './Participant'; // <-- ADD THIS LINE

const EventSchema: Schema<IEvent> = new Schema({
  name: {
    type: String,
    required: [true, 'Event name is required.'],
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Event date is required.'],
  },
  location: {
    type: String,
    required: [true, 'Event location is required.'],
  },
  description: {
    type: String,
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'Participant', // This 'ref' is why the import is needed
  }],
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Prevent model overwrite in development
const Event: Model<IEvent> = models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
