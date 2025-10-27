// src/lib/types.ts
import { Document, Types } from 'mongoose';

// --- Updated interfaces to include timestamps ---
export interface IEvent extends Document {
  _id: Types.ObjectId;
  name: string;
  date: Date;
  location: string;
  participants: Types.ObjectId[] | IParticipant[];
  description?: string;
  createdAt?: Date; // FIX: Added createdAt
  updatedAt?: Date; // FIX: Added updatedAt
}

export interface IParticipant extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  eventId: Types.ObjectId | IEvent;
  attended: boolean;
  createdAt?: Date; // FIX: Added createdAt
  updatedAt?: Date; // FIX: Added updatedAt
}

export interface IStudent extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  year?: number;
  group?: string;
  createdAt?: Date; // FIX: Added createdAt
  updatedAt?: Date; // FIX: Added updatedAt
}

export interface IAdmin extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  rollNumber?: string;
  team?: string;
  adminRole?: string; // e.g., 'Manager', 'Volunteer'
  createdAt?: Date; // FIX: Added createdAt
  updatedAt?: Date; // FIX: Added updatedAt
}