import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';
import mongoose from 'mongoose'; // FIX: Added mongoose import
import { Types } from 'mongoose'; // FIX: Import Types for ObjectId
import { IEvent, IParticipant } from '@/lib/types'; // Import IParticipant

// GET: Fetch all events
export async function GET() { // Removed unused 'request' parameter
  try {
    await connectDB();

    // Fetch events as plain JS objects
    // FIX: Type the result of find().lean() more accurately
    const events = await Event.find({})
      .sort({ date: -1 })
      .lean<IEvent[]>(); // Use .lean<Type>() for better typing

    // Transform the events for serialization
    // FIX: Use IEvent type in map, remove 'any'
    const formattedEvents = events.map((event: IEvent) => ({
      ...event,
      _id: event._id?.toString(),
      // FIX: Check if participants are ObjectIds or populated objects (lean won't populate fully)
      // Assuming they are ObjectIds based on lean() without populate here
      participants: Array.isArray(event.participants)
        ? event.participants.map((p: Types.ObjectId | IParticipant | string) => { // Use appropriate type
            if (typeof p === 'string') return p;
            return p?.toString(); // Handle potential ObjectId
          })
        : [],
      date: event.date ? new Date(event.date).toISOString() : undefined,
      createdAt: event.createdAt ? new Date(event.createdAt).toISOString() : undefined,
      updatedAt: event.updatedAt ? new Date(event.updatedAt).toISOString() : undefined
    }));

    return NextResponse.json({
      success: true,
      data: formattedEvents
    });

  } catch (error: unknown) { // FIX: Use unknown instead of casting directly to Error
    console.error('[GET /api/events] Error:', error);
    const message = (error instanceof Error) ? error.message : 'An unknown error occurred fetching events';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// FIX: Define an interface for the expected POST request body
interface CreateEventBody {
  name: string;
  date: string; // Expect date as string from JSON
  location: string;
  description?: string;
}

// POST: Create a new event
export async function POST(request: Request) {
  try {
    await connectDB();

    // FIX: Type the body
    const body: CreateEventBody = await request.json();

    // Basic validation
    if (!body.name || !body.date || !body.location) {
        return NextResponse.json({ success: false, error: 'Missing required fields: name, date, location' }, { status: 400 });
    }

    // Ensure date is properly parsed before creating
    const eventData = {
      name: body.name,
      date: new Date(body.date), // Parse the date string
      location: body.location,
      description: body.description,
      participants: [] // Start with empty participants array
    };

    // Create the event using the Mongoose model
    const newEvent = await Event.create(eventData);

    // Mongoose document already handles types, convert to plain object for response
    const eventObject = newEvent.toObject();

    // Format the response, ensuring correct types
    const formattedEvent = {
      ...eventObject,
      _id: eventObject._id.toString(),
      date: eventObject.date?.toISOString(),
      // Timestamps are automatically Date objects from Mongoose
      createdAt: eventObject.createdAt?.toISOString(),
      updatedAt: eventObject.updatedAt?.toISOString(),
      // Ensure participants array is included, even if empty
      participants: Array.isArray(eventObject.participants) ? eventObject.participants.map(p => p.toString()) : []
    };

    return NextResponse.json(
      { success: true, data: formattedEvent },
      { status: 201 }
    );

  } catch (error: unknown) { // FIX: Use unknown
    console.error('[POST /api/events] Error:', error);
    let statusCode = 500; // Default to internal server error
    let message = 'An unknown error occurred creating the event';

    if (error instanceof mongoose.Error.ValidationError) {
        statusCode = 400; // Bad request for validation errors
        message = error.message;
    } else if (error instanceof Error) {
        message = error.message;
        // Keep statusCode 500 for other generic errors
    }

    return NextResponse.json(
      { success: false, error: message },
      { status: statusCode } // Use dynamic status code
    );
  }
}