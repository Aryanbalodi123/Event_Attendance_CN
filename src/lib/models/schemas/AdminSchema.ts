import mongoose from 'mongoose';
import { IAdmin } from '../../types'; // We will create this type

const AdminSchema = new mongoose.Schema<IAdmin>(
  {
    name: {
      type: String,
      required: [true, 'Admin name is required.'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Admin email is required.'],
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: [6, 'Password must be at least 6 characters.'],
    },
    // Your new fields
    rollNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // Allows null/empty values to not violate unique
    },
    team: {
      type: String,
      trim: true,
    },
    adminRole: { // Renamed from 'role' to avoid confusion
      type: String,
      trim: true,
      default: 'Member',
    },
  },
  {
    timestamps: true,
  }
);

export default AdminSchema;