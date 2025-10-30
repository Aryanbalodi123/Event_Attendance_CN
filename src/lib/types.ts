// src/lib/types.ts
import { Document, Types } from 'mongoose';

// --- Event Interface ---
export interface IEvent extends Document {
  _id: Types.ObjectId;
  name: string;
  date: Date;
  location: string;
  participants: Types.ObjectId[] | IParticipant[];
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// --- Participant Interface (Updated) ---
export interface IParticipant extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  rollNumber: string; // <-- ADDED THIS FIELD
  eventId: Types.ObjectId | IEvent;
  attended: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// --- Other interfaces remain unchanged ---
export interface IStudent extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  year?: number;
  group?: string;
  createdAt?: Date;
  updatedAt?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  lastPasswordReset?: Date;
}

export interface IAdmin extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  rollNumber?: string;
  team?: string;
  adminRole?: string;
  createdAt?: Date;
  updatedAt?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  lastPasswordReset?: Date;
}