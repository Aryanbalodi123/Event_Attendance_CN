// src/app/api/participants/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@lib/mongodb';
import Event from '@lib/models/Event';
import Participant from '@lib/models/Participant';

export async function POST(request: Request) {
  await connectDB();
  try {
    const { name, email, eventId } = await request.json();

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    // Check if participant is already registered for this event
    const existingParticipant = await Participant.findOne({ email, eventId });
    if (existingParticipant) {
      return NextResponse.json(
        { success: false, error: 'Participant is already registered for this event' },
        { status: 400 }
      );
    }

    // Create new participant
    const newParticipant = await Participant.create({ name, email, eventId });

    // Add participant reference to the event's participants array
    event.participants.push(newParticipant._id);
    await event.save();

    return NextResponse.json({ success: true, data: newParticipant }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}