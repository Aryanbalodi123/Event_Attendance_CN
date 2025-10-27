// src/lib/types.ts
import { Document, Types } from 'mongoose';

// --- Your Event and Participant interfaces remain unchanged ---
export interface IEvent extends Document {
  _id: Types.ObjectId;
  name: string;
  date: Date;
  location: string;
  participants: Types.ObjectId[] | IParticipant[];
  description?: string;
}

export interface IParticipant extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  eventId: Types.ObjectId | IEvent;
  attended: boolean;
}

// --- DELETE THE IUser INTERFACE AND REPLACE WITH THESE TWO ---

export interface IStudent extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  year?: number;
  group?: string;
}

export interface IAdmin extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  rollNumber?: string;
  team?: string;
  adminRole?: string; // e.g., 'Manager', 'Volunteer'
}