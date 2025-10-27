import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Participant from '@/lib/models/Participant';
import mongoose from 'mongoose'; // Import mongoose

export async function POST(request: Request) {
  console.log('--- /api/attendance/mark endpoint hit ---'); // Log start
  try {
    console.log('Attempting DB connection...');
    await connectDB();
    console.log('DB connected.');

    console.log('Parsing request body...');
    const body = await request.json();
    const { participantId, eventId } = body;
    console.log('Body parsed:', { participantId, eventId });

    if (!participantId || !eventId) {
      console.log('Validation failed: Missing IDs.');
      return NextResponse.json({ success: false, error: 'Participant ID and Event ID are required' }, { status: 400 });
    }

    // Add ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(participantId) || !mongoose.Types.ObjectId.isValid(eventId)) {
        console.log('Validation failed: Invalid ObjectId format.');
        return NextResponse.json({ success: false, error: 'Invalid ID format provided' }, { status: 400 });
    }

    console.log(`Finding participant ${participantId}...`);
    const participant = await Participant.findById(participantId);

    if (!participant) {
      console.log(`Participant ${participantId} not found.`);
      return NextResponse.json({ success: false, error: 'Participant not found' }, { status: 404 });
    }
    console.log(`Participant ${participantId} found.`);

    // SECURITY CHECK
    if (participant.eventId.toString() !== eventId) {
      console.log(`Event ID mismatch: Participant event ${participant.eventId}, Scanned event ${eventId}`);
      return NextResponse.json({ success: false, error: 'Participant not registered for this event' }, { status: 403 });
    }
    console.log('Event ID check passed.');

    if (participant.attended) {
      console.log(`Participant ${participantId} already attended.`);
      // Still return success and data, just with a specific message
      return NextResponse.json({ success: true, data: participant.toObject(), message: 'Already marked as attended.' });
    }

    console.log(`Marking participant ${participantId} as attended...`);
    participant.attended = true;
    await participant.save();
    console.log(`Participant ${participantId} saved successfully.`);

    // Send back a clear success message
    console.log('Sending success response.');
    // Use .toObject() to ensure plain JS object in response
    return NextResponse.json({ success: true, data: participant.toObject(), message: 'Attendance Marked!' });

  } catch (error: unknown) {
    // Log the raw error for more details
    console.error('--- ERROR in /api/attendance/mark ---:', error);
    const message = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}