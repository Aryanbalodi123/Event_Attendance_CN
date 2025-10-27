// src/lib/mongodb.ts
import mongoose, { Mongoose } from 'mongoose'; // Import Mongoose type

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// Define an interface for the global mongoose cache
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Augment globalThis so we can avoid using 'any'
declare global {
  interface GlobalThis {
    mongoose?: MongooseCache;
  }
}

// Use the typed globalThis.mongoose if present
let cached = (globalThis as unknown as { mongoose?: MongooseCache }).mongoose;

if (!cached) {
  (globalThis as unknown as { mongoose?: MongooseCache }).mongoose = { conn: null, promise: null };
  cached = (globalThis as unknown as { mongoose?: MongooseCache }).mongoose;
}

async function connectDB(): Promise<Mongoose> {
  if (cached!.conn) {
    console.log('Using cached database connection');
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false, // Recommended option
      // Consider adding other options like serverSelectionTimeoutMS if needed
    } as const;

    console.log('Attempting new database connection...');
    // Ensure MONGODB_URI is definitely treated as string (it's checked above)
    cached!.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      console.log('New database connection established successfully');
      return mongooseInstance;
    }).catch(error => {
        console.error('Database connection failed:', error);
        // Reset promise so subsequent calls can retry
        cached!.promise = null;
        throw error; // Re-throw error to indicate connection failure
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (error) {
     // If the promise failed, ensure conn is null and re-throw
     cached!.conn = null;
     throw error;
  }

  // Ensure connection is returned even if promise was already resolved
  if (!cached!.conn) {
     // This case might happen if the promise resolved but somehow conn wasn't set, though unlikely with await
     throw new Error("Mongoose connection failed to establish.");
  }

  return cached!.conn;
}

export default connectDB;