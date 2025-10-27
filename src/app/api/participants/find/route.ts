// src/app/api/participants/find/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@lib/mongodb';
import Participant from '@lib/models/Participant';
import { IParticipant } from '@lib/types';

export async function POST(request: Request) {
  await connectDB();
  try {
    const { email, eventId } = await request.json();

    if (!email || !eventId) {
      return NextResponse.json({ success: false, error: 'Email and Event ID are required' }, { status: 400 });
    }

    // Find the participant by email and eventId
    const participant: IParticipant | null = await Participant.findOne({ 
      email: email.toLowerCase(), 
      eventId: eventId 
    });

    if (!participant) {
      return NextResponse.json({ success: false, error: 'Participant not found for this event. Check your email or selected event.' }, { status: 404 });
    }

    // Send back the full participant data (including the all-important _id)
    return NextResponse.json({ success: true, data: participant });

  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}