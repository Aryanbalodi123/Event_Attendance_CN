import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Student from '@/lib/models/Student'; // Import Student
import Admin from '@/lib/models/Admin'; // Import Admin
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

    // --- IMPORTANT: Define user type explicitly ---
    // We use a union type to hold either a student or admin
    let user: IStudent | IAdmin | null = null;
    // We need a separate variable to hold the password,
    // as our types IStudent/IAdmin don't include it by default.
    let userPasswordHash: string | undefined = undefined;

    console.log(`[LOGIN] Attempting login for ${email} as ${role}`);

    if (role === 'student') {
      // Find student and explicitly select the password
      const studentUser = await Student.findOne({ email: email.toLowerCase() }).select('+password');
      if (studentUser) {
        user = studentUser.toObject(); // Convert to plain JS object
        userPasswordHash = studentUser.password;
      }
      console.log(`[LOGIN] Student lookup result: ${user ? 'Found' : 'Not found'}`);
      if (user) console.log(`[LOGIN] Password field present: ${!!userPasswordHash}`);

    } else if (role === 'admin') {
      // Find admin and explicitly select the password
      const adminUser = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
      if (adminUser) {
        user = adminUser.toObject(); // Convert to plain JS object
        userPasswordHash = adminUser.password;
      }
      console.log(`[LOGIN] Admin lookup result: ${user ? 'Found' : 'Not found'}`);
      if (user) console.log(`[LOGIN] Password field present: ${!!userPasswordHash}`);

    } else {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 });
    }

    // Check for user AND the retrieved password hash
    if (!user || !userPasswordHash) {
      console.log(`[LOGIN] Auth failed - ${!user ? 'User not found' : 'Password field missing'}`);
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Compare the password
    console.log('[LOGIN] Attempting password comparison');
    const isMatch = await bcrypt.compare(password, userPasswordHash);
    console.log(`[LOGIN] Password comparison result: ${isMatch ? 'Match' : 'No match'}`);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // ---
    // --- THIS IS THE LONG-TERM FIX ---
    // ---
    console.log('[LOGIN] Password OK. Creating session...');
    const userIdString = user._id.toString();

    if (role === 'student') {
      // We MUST cast the user to IStudent to access rollNumber
      const studentUser = user as IStudent;
      console.log(`[LOGIN] Creating STUDENT session for ${studentUser.email} with roll ${studentUser.rollNumber}`);
      await createSession(
        userIdString,
        role,
        studentUser.name,
        studentUser.email,
        studentUser.rollNumber // <-- HERE IS THE FIX
      );
    } else {
      // Admin session (no rollNumber)
      console.log(`[LOGIN] Creating ADMIN session for ${user.email}`);
      await createSession(
        userIdString,
        role,
        user.name,
        user.email
        // No rollNumber needed for admin
      );
    }
    // --- END OF FIX ---

    // Return session data (without password)
    return NextResponse.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: role,
        // Conditionally include rollNumber in the response data as well
        ...(role === 'student' && { rollNumber: (user as IStudent).rollNumber })
      }
    });

  } catch (error) {
    const message = (error as Error).message;
    console.error('[LOGIN] Internal Server Error:', error); // Log the full error
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
