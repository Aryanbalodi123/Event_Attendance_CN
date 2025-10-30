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

    const event = await Event.findById(id)
      .populate<{ participants: IParticipant[] }>('participants') // Specify populated field type
      .lean(); // Use lean for performance if not modifying

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    const formattedEvent = {
      ...event,
      _id: event._id?.toString(),
      date: event.date?.toISOString(), // Assuming date is stored as Date
      participants: (event.participants || []).map((p: IParticipant) => ({
        _id: p._id?.toString(),
        name: p.name,
        email: p.email,
        // --- THIS LINE IS CORRECT ---
        rollNumber: p.rollNumber,
        // ---------------------------
        attended: p.attended,
        createdAt: p.createdAt?.toISOString()
      }))
    };

    return NextResponse.json(
      { success: true, data: formattedEvent },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = (error instanceof Error) ? error.message : 'An unknown error occurred';
    console.error('[GET /api/events/[id]] Error:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// PUT - Update an event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
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
    const { name, date, location, description } = body;

    if (!name || !date || !location) {
      return NextResponse.json(
        { success: false, error: 'Name, date, and location are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { name, date, location, description },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedEvent) {
      return NextResponse.json(
        { success: false, error: 'Event not found or failed to update' },
        { status: 404 }
      );
    }
    
    const formattedUpdate = {
        ...updatedEvent,
        _id: updatedEvent._id?.toString(),
        date: updatedEvent.date?.toISOString(),
    };

    return NextResponse.json(
      { success: true, data: formattedUpdate },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = (error instanceof Error) ? error.message : 'An unknown error occurred';
    console.error('[PUT /api/events/[id]] Error:', message);
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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
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

    return NextResponse.json(
      { success: true, message: 'Event deleted successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = (error instanceof Error) ? error.message : 'An unknown error occurred';
    console.error('[DELETE /api/events/[id]] Error:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}