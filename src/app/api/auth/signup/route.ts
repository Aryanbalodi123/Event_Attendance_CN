import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Student from '@/lib/models/Student'; // Import Student
import Admin from '@/lib/models/Admin';   // Import Admin
import bcrypt from 'bcrypt';
import { createSession } from '@/lib/auth';

export async function POST(request: Request) {
  await connectDB();
  try {
    const body = await request.json();
    const { role, name, email, password, rollNumber } = body;

    if (!role || !name || !email || !password || (role === 'student' && !rollNumber)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    if (role === 'student') {
      const { year, group } = body;

      // Check if student already exists (by email or rollNumber)
      const existingStudent = await Student.findOne({ $or: [
        { email: email.toLowerCase() },
        { rollNumber: rollNumber.trim().toLowerCase() }
      ] });
      if (existingStudent) {
        return NextResponse.json(
          { success: false, error: 'Student with this email or roll number already exists' },
          { status: 400 }
        );
      }

      // Create new student
      const newStudent = await Student.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        year,
        group,
        rollNumber: rollNumber.trim().toLowerCase(),
      });

      // --- FIX: Convert ObjectId to string ---
      await createSession(newStudent._id.toString(), 'student', newStudent.name, newStudent.email, newStudent.rollNumber);
      
      return NextResponse.json(
        { success: true, data: { id: newStudent._id, name: newStudent.name, email: newStudent.email, role: 'student', rollNumber: newStudent.rollNumber } },
        { status: 201 }
      );

    } else if (role === 'admin') {
      const { rollNumber, team, adminRole } = body;

      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
      if (existingAdmin) {
        return NextResponse.json(
          { success: false, error: 'Admin with this email already exists' },
          { status: 400 }
        );
      }

      // Create new admin
      const newAdmin = await Admin.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        rollNumber,
        team,
        adminRole,
      });

      // --- FIX: Convert ObjectId to string ---
      await createSession(newAdmin._id.toString(), 'admin', newAdmin.name, newAdmin.email);
      
      return NextResponse.json(
        { success: true, data: { id: newAdmin._id, name: newAdmin.name, email: newAdmin.email, role: 'admin' } },
        { status: 201 }
      );

    } else {
      return NextResponse.json({ success: false, error: 'Invalid role specified' }, { status: 400 });
    }

  } catch (error) {
    const message = (error as Error).message;
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}