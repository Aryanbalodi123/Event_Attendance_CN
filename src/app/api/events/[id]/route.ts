import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';
import Participant from '@/lib/models/Participant'; // ADD THIS LINE - Import Participant model
import mongoose from 'mongoose';

// GET - Fetch a single event by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await params to get the actual object
  const { id } = await params;
  
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
    
    // The Participant model is now registered because we imported it above
    const event = await Event.findById(id)
      .populate('participants')
      .lean() as any;
    
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Transform MongoDB ObjectIds to strings for JSON response
    const formattedEvent = {
      ...event,
      _id: event._id?.toString(),
      date: event.date?.toISOString(),
      participants: (event.participants || []).map((p: any) => ({
        _id: p._id?.toString(),
        name: p.name,
        email: p.email,
        attended: p.attended,
        createdAt: p.createdAt?.toISOString()
      }))
    };

    return NextResponse.json(
      { success: true, data: formattedEvent },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[GET /api/events/[id]] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

// PUT - Update an event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
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
    );

    if (!updatedEvent) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedEvent },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[PUT /api/events/[id]] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
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
  } catch (error: any) {
    console.error('[DELETE /api/events/[id]] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete event' },
      { status: 500 }
    );
  }
}