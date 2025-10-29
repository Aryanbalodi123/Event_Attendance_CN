import mongoose from 'mongoose';
import { IStudent } from '../../types';

const StudentSchema = new mongoose.Schema<IStudent>(
  {
    name: {
      type: String,
      required: [true, 'Student name is required.'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Student email is required.'],
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: [6, 'Password must be at least 6 characters.'],
      select: false, // Hide password by default on queries
    },
    year: {
      type: Number,
    },
    group: {
      type: String,
      trim: true,
    },

    // --- NEW FIELDS FOR PASSWORD RESET ---
    resetToken: {
      type: String,
      select: false, // Hide by default
    },
    resetTokenExpiry: {
      type: Date,
      select: false, // Hide by default
    },
    lastPasswordReset: {
      type: Date,
      select: false, // Hide by default
    },
    // -------------------------------------
  },
  {
    timestamps: true,
  }
);

// Remove the pre-find hooks that were causing issues with password selection
// The select:false in the schema is sufficient for security

export default StudentSchema;