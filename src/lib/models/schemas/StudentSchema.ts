import mongoose from 'mongoose';
import { IStudent } from '../../types'; // We will create this type

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
    },
    year: {
      type: Number,
    },
    group: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default StudentSchema;