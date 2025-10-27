import mongoose from 'mongoose';
import { IAdmin } from '../types';
import AdminSchema from './schemas/AdminSchema';

// Only create the model if it doesn't exist
const Admin = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;