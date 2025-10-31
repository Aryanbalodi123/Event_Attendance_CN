// src/app/api/participants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@lib/mongodb';
import Event from '@lib/models/Event';
import Participant from '@lib/models/Participant';
import { revalidatePath } from 'next/cache';

// POST: Create a new participant
export async function POST(request: Request) {
  await connectDB();
  try {
    const { name, email, rollNumber, eventId } = await request.json(); // <-- Added rollNumber

    // --- Added rollNumber to validation ---
    if (!name || !email || !rollNumber || !eventId) {
      return NextResponse.json(
        { success: false, error: 'Name, email, roll number, and event ID are required.' },
        { status: 400 }
      );
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    // Check for duplicate roll number across all participants
    const existingRollNumber = await Participant.findOne({ rollNumber: rollNumber.toLowerCase() });
    if (existingRollNumber) {
      return NextResponse.json(
        { success: false, error: 'This roll number is already registered' },
        { status: 400 }
      );
    }

    // Check if participant is already registered for this event
    const existingParticipant = await Participant.findOne({ email, eventId });
    if (existingParticipant) {
      return NextResponse.json(
        { success: false, error: 'Participant is already registered for this event' },
        { status: 400 }
      );
    }

    // --- Create new participant with rollNumber ---
    const newParticipant = await Participant.create({ name, email, rollNumber, eventId });

    // Add participant reference to the event's participants array
    event.participants.push(newParticipant._id);
    await event.save();

    // Revalidate the event page path to show new data
    revalidatePath(`/admin/events/${eventId}`);

    return NextResponse.json({ success: true, data: newParticipant }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}


// --- NEW DELETE FUNCTION ---
// DELETE: Delete a participant by ID
export async function DELETE(request: NextRequest) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Participant ID is required' },
        { status: 400 }
      );
    }

    // Find and delete the participant
    const deletedParticipant = await Participant.findByIdAndDelete(id);

    if (!deletedParticipant) {
      return NextResponse.json(
        { success: false, error: 'Participant not found' },
        { status: 404 }
      );
    }

    // Remove participant's ID from the corresponding event's participants array
    await Event.findByIdAndUpdate(deletedParticipant.eventId, {
      $pull: { participants: deletedParticipant._id },
    });

    // Revalidate the event page to reflect the change
    revalidatePath(`/admin/events/${deletedParticipant.eventId.toString()}`);

    return NextResponse.json({ success: true, data: { message: 'Participant deleted' } }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}