import mongoose from 'mongoose';
import { IStudent } from '../types';
import StudentSchema from './schemas/StudentSchema';

// Only create the model if it doesn't exist
const Student = mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);

export default Student;