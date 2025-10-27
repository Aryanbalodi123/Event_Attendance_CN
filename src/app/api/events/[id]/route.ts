import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';
// import Participant from '@/lib/models/Participant'; // FIX: Removed unused import
import mongoose from 'mongoose';
import { IParticipant } from '@/lib/types'; // Import only IParticipant

// GET - Fetch a single event by ID
export async function GET(
  request: NextRequest, // Use NextRequest for consistency
  { params }: { params: Promise<{ id: string }> } // Keep params as Promise type
) {
  // Await params to get the actual object
  const resolvedParams = await params;
  const { id } = resolvedParams;

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Event ID is required' },
      { status: 400 }
    );
  }

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, error: 'Invalid Event ID format' },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    // Fetch and populate. Use generic type assertion for populated result.
    // `.lean()` returns plain JS objects, not Mongoose documents.
    // FIX: Define a type for the populated event instead of 'any'
    const event = await Event.findById(id)
      .populate<{ participants: IParticipant[] }>('participants') // Specify populated field type
      .lean(); // Use lean for performance if not modifying

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Transform MongoDB ObjectIds to strings for JSON response
    // We already have types from lean() and populate<>
    const formattedEvent = {
      ...event,
      _id: event._id?.toString(),
      date: event.date?.toISOString(), // Assuming date is stored as Date
      participants: (event.participants || []).map((p: IParticipant) => ({ // FIX: Use IParticipant type
        _id: p._id?.toString(),
        name: p.name,
        email: p.email,
        attended: p.attended,
        createdAt: p.createdAt?.toISOString() // Ensure createdAt is Date in schema for this
      }))
    };

    return NextResponse.json(
      { success: true, data: formattedEvent },
      { status: 200 }
    );
  } catch (error: unknown) { // FIX: Changed any to unknown
    const message = (error instanceof Error) ? error.message : 'An unknown error occurred';
    console.error('[GET /api/events/[id]] Error:', message); // Log the extracted message
    return NextResponse.json(
      { success: false, error: message }, // Return the extracted message
      { status: 500 }
    );
  }
}

// PUT - Update an event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Keep params as Promise type
) {
  const resolvedParams = await params; // Resolve the promise
  const { id } = resolvedParams;

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Event ID is required' },
      { status: 400 }
    );
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, error: 'Invalid Event ID format' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    // It's good practice to explicitly list fields to update for security
    const { name, date, location, description } = body;

    // Optional: Add validation for incoming body fields if needed
    if (!name || !date || !location) {
      return NextResponse.json(
        { success: false, error: 'Name, date, and location are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Use specific fields in the update operation
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { name, date, location, description }, // Update only allowed fields
      { new: true, runValidators: true }
    ).lean(); // Use lean if you just need the data

    if (!updatedEvent) {
      return NextResponse.json(
        { success: false, error: 'Event not found or failed to update' },
        { status: 404 }
      );
    }

    // Format the response if needed (similar to GET)
    const formattedUpdate = {
        ...updatedEvent,
        _id: updatedEvent._id?.toString(),
        date: updatedEvent.date?.toISOString(),
        // participants might not be populated here unless explicitly requested/handled
    };

    return NextResponse.json(
      { success: true, data: formattedUpdate }, // Send formatted data
      { status: 200 }
    );
  } catch (error: unknown) { // FIX: Changed any to unknown
    const message = (error instanceof Error) ? error.message : 'An unknown error occurred';
    console.error('[PUT /api/events/[id]] Error:', message);
     // Handle Mongoose validation errors specifically
    if (error instanceof mongoose.Error.ValidationError) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// DELETE - Delete an event
export async function DELETE(
  request: NextRequest, // request might be unused but keep for signature consistency
  { params }: { params: Promise<{ id: string }> } // Keep params as Promise type
) {
  const resolvedParams = await params; // Resolve the promise
  const { id } = resolvedParams;

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Event ID is required' },
      { status: 400 }
    );
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, error: 'Invalid Event ID format' },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Optional: Add logic here to clean up related data, e.g., Participants
    // await Participant.deleteMany({ eventId: id });

    return NextResponse.json(
      { success: true, message: 'Event deleted successfully' },
      { status: 200 } // Or 204 No Content if preferred for DELETE
    );
  } catch (error: unknown) { // FIX: Changed any to unknown
    const message = (error instanceof Error) ? error.message : 'An unknown error occurred';
    console.error('[DELETE /api/events/[id]] Error:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}