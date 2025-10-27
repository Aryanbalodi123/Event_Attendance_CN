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

    // FIX 1: The type for 'user' was corrected.
    // 'null' is now part of the union, not the intersection.
    let user: ((IStudent | IAdmin) & { password?: string }) | null = null;

    // Find the user in the correct collection
    if (role === 'student') {
      user = await Student.findOne({ email: email.toLowerCase() }).select('+password');
    } else if (role === 'admin') {
      user = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
    } else {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 });
    }

    if (!user || !user.password) { // Check for user AND password
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
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