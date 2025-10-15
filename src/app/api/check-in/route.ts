import { NextResponse } from 'next/server';
import { validCodes } from '../qr-code/route'; // <-- Import the valid codes!

export interface Student {
  name: string;
  rollNumber: string;
  email: string;
  branch: string;
  group: string;
  timestamp: string;
}

let checkedInStudents: Student[] = [];

export async function GET() {
  const sortedStudents = checkedInStudents.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return NextResponse.json(sortedStudents);
}

export async function POST(request: Request) {
  try {
    // The student app will now send the qrCodeValue along with their details
    const body = await request.json();
    const { qrCodeValue, ...studentData } = body;

    // --- VALIDATION LOGIC ---
    if (!qrCodeValue || !validCodes.has(qrCodeValue)) {
      return NextResponse.json({ message: 'Invalid or expired QR Code.' }, { status: 400 });
    }
    // -------------------------

    const isAlreadyCheckedIn = checkedInStudents.some(
      (student) => student.rollNumber === studentData.rollNumber
    );

    if (isAlreadyCheckedIn) {
      return NextResponse.json({ message: 'You have already checked in.' }, { status: 409 });
    }

    const newStudentEntry: Student = {
      ...studentData,
      timestamp: new Date().toISOString(),
    };

    checkedInStudents.push(newStudentEntry);

    // Optional: Remove the used code to prevent reuse (extra security)
    // validCodes.delete(qrCodeValue); 

    return NextResponse.json({ message: 'Check-in successful!', student: newStudentEntry }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Invalid data provided.' }, { status: 400 });
  }
}