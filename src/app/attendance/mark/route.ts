import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Participant from '@/lib/models/Participant';

export async function POST(request: Request) {
  await connectDB();
  try {
    const { participantId, eventId } = await request.json(); // Now expecting eventId

    if (!participantId || !eventId) {
      return NextResponse.json({ success: false, error: 'Participant ID and Event ID are required' }, { status: 400 });
    }

    const participant = await Participant.findById(participantId);

    if (!participant) {
      return NextResponse.json({ success: false, error: 'Participant not found' }, { status: 404 });
    }

    // SECURITY CHECK: Ensure participant belongs to this event
    if (participant.eventId.toString() !== eventId) {
      return NextResponse.json({ success: false, error: 'Participant not registered for this event' }, { status: 403 });
    }

    if (participant.attended) {
      return NextResponse.json({ success: true, data: participant, message: 'Already marked as attended.' });
    }

    // Mark as attended and save
    participant.attended = true;
    await participant.save();

    // Send back a clear success message
    return NextResponse.json({ success: true, data: participant, message: 'Attendance Marked!' });

  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
