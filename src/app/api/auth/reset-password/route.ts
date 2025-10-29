// src/app/api/auth/reset-password/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Student from '@/lib/models/Student';
import Admin from '@/lib/models/Admin';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { IStudent } from '@/lib/types';
import { IAdmin } from '@/lib/types';

export async function POST(request: Request) {
  await connectDB();
  try {
    const { token, password, confirmPassword } = await request.json();

    if (!token || !password || !confirmPassword) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, error: 'Passwords do not match' }, { status: 400 });
    }

    // 1. Hash the incoming token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 2. Find user (check both collections)
    let user: (IStudent | IAdmin) | null = null;
    let UserModel: typeof Student | typeof Admin = Student; // To store which model we found the user in

    // Check Student collection
    user = await Student.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    }); // No .select() needed, we just need the _id

    // If not found in students, check Admin collection
    if (!user) {
      UserModel = Admin; // Switch to Admin model
      user = await Admin.findOne({
        resetToken: hashedToken,
        resetTokenExpiry: { $gt: Date.now() },
      }); // No .select() needed
    }

    if (!user) {
      return NextResponse.json({ success: false, error: 'Token is invalid or has expired' }, { status: 400 });
    }

    // 3. Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Use findByIdAndUpdate for a direct atomic update
    // This avoids issues with fields that are marked `select: false` on the schema
    const updateResult = await UserModel.findByIdAndUpdate(
      user._id,
      {
        $set: {
          password: hashedPassword,
          lastPasswordReset: new Date(), // Set the 24-hour limit timestamp
        },
        $unset: {
          resetToken: '', // Clear the token fields
          resetTokenExpiry: '',
        },
      },
      { new: true }
    );

    // 5. Sanity-check: re-fetch the updated user including the hidden password and verify it matches
    const verifiedUser = await UserModel.findById(user._id).select('+password');
    if (!updateResult || !verifiedUser || !verifiedUser.password) {
      console.error('[RESET_PASSWORD_UPDATE_FAILED]', { userId: user._id, updateResult });
      return NextResponse.json({ success: false, error: 'Failed to update password. Please try again.' }, { status: 500 });
    }

    const check = await bcrypt.compare(password, verifiedUser.password);
    if (!check) {
      // If the newly saved password doesn't match the plaintext, something went wrong during hashing/storage
      console.error('[RESET_PASSWORD_HASH_MISMATCH]', { userId: user._id });
      return NextResponse.json({ success: false, error: 'Password did not save correctly. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Password has been reset successfully!' });

  } catch (error: unknown) {
    console.error('[RESET_PASSWORD_API_ERROR]', error);
    const message = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}