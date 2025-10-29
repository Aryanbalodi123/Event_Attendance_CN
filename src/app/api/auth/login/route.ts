// src/app/api/auth/login/route.ts

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Student from '@/lib/models/Student'; // Import Student
import Admin from '@/lib/models/Admin';   // Import Admin
import bcrypt from 'bcrypt';
import { createSession } from '@/lib/auth';
import { IStudent, IAdmin } from '@/lib/types'; // Import types

export async function POST(request: Request) {
  await connectDB();
  try {
    const { email, password, role } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and role are required' },
        { status: 400 }
      );
    }


    let user: ((IStudent | IAdmin) & { password?: string }) | null = null;

    // Find the user in the correct collection
    console.log(`[LOGIN] Attempting login for ${email} as ${role}`);
    
    if (role === 'student') {
      // --- THIS IS THE FIX ---
      user = await Student.findOne({ email: email.toLowerCase() }).select('+password');
      // ----------------------
      console.log(`[LOGIN] Student lookup result: ${user ? 'Found' : 'Not found'}`);
      if (user) console.log(`[LOGIN] Password field present: ${!!user.password}`);
    } else if (role === 'admin') {
      // --- THIS IS THE FIX ---
      user = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
      // ----------------------
      console.log(`[LOGIN] Admin lookup result: ${user ? 'Found' : 'Not found'}`);
      if (user) console.log(`[LOGIN] Password field present: ${!!user.password}`);
    } else {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 });
    }

    if (!user || !user.password) { // Check for user AND password
      console.log(`[LOGIN] Auth failed - ${!user ? 'User not found' : 'Password field missing'}`);
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Compare the password
    console.log('[LOGIN] Attempting password comparison');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`[LOGIN] Password comparison result: ${isMatch ? 'Match' : 'No match'}`);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // FIX 2: Convert 'user._id' from ObjectId to string
    await createSession(user._id.toString(), role, user.name, user.email);

    return NextResponse.json({ 
      success: true, 
      data: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: role 
      } 
    });

  } catch (error) {
    const message = (error as Error).message;
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}