import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';

export async function GET() {
  try {
    await connectDB();
    
    const events = await Event.find({})
      .sort({ date: -1 })
      .lean();

    // Transform the events to ensure proper serialization
    const formattedEvents = (events as any[]).map((event: any) => ({
      ...event,
      _id: event._id?.toString(),
      participants: Array.isArray(event.participants) ? event.participants.map((p: any) => p?.toString()) : [],
      date: event.date ? new Date(event.date).toISOString() : undefined,
      createdAt: event.createdAt ? new Date(event.createdAt).toISOString() : undefined,
      updatedAt: event.updatedAt ? new Date(event.updatedAt).toISOString() : undefined
    }));

    return NextResponse.json({ 
      success: true, 
      data: formattedEvents 
    });
  
  } catch (error) {
    console.error('[GET /api/events] Error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Ensure date is properly parsed
    const eventData = {
      ...body,
      date: new Date(body.date),
      participants: [] // Start with empty participants array
    };

    const event = await Event.create(eventData);
    
    // Format the response
    const formattedEvent = {
      ...event.toObject(),
      _id: event._id.toString(),
      date: event.date ? (event.date instanceof Date ? event.date.toISOString() : new Date(event.date).toISOString()) : undefined,
      createdAt: event.createdAt ? (event.createdAt instanceof Date ? event.createdAt.toISOString() : new Date(event.createdAt).toISOString()) : undefined,
      updatedAt: event.updatedAt ? (event.updatedAt instanceof Date ? event.updatedAt.toISOString() : new Date(event.updatedAt).toISOString()) : undefined
    };

    return NextResponse.json(
      { success: true, data: formattedEvent }, 
      { status: 201 }
    );

  } catch (error) {
    console.error('[POST /api/events] Error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message }, 
      { status: 400 }
    );
  }
}
