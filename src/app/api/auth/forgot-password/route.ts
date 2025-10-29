// src/app/api/auth/forgot-password/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Student from '@/lib/models/Student';
import Admin from '@/lib/models/Admin';
import { sendEmail } from '@/lib/nodemailer';
import crypto from 'crypto';

// Helper function (no changes)
const createEmailHtml = (name: string, resetUrl: string) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2>Password Reset Request</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset your password for the CN Events Portal. If you did not make this request, please ignore this email.</p>
    <p>To reset your password, click the link below. This link is valid for 10 minutes:</p>
    <a href="${resetUrl}" style="background-color: #F97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
      Reset Your Password
    </a>
    <p>Or copy and paste this URL into your browser:</p>
    <p>${resetUrl}</p>
    <p>Thanks,<br/>Coding Ninjas CUIET</p>
  </div>
`;

export async function POST(request: Request) {
  await connectDB();
  try {
    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json({ success: false, error: 'Email and role are required' }, { status: 400 });
    }

    const UserCollection = role === 'student' ? Student : Admin;

    // --- THIS IS THE FIX ---

    // 1. Find the user just by email to get their _id
    const baseUser = await UserCollection.findOne({ email: email.toLowerCase() });

    if (!baseUser) {
      console.log(`Password reset attempt for non-existent user: ${email}`);
      return NextResponse.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
    }
    
    // 2. Fetch the user AGAIN by ID, this time selecting ALL hidden reset fields
    const user = await UserCollection.findById(baseUser._id)
                                     .select('+lastPasswordReset +resetToken +resetTokenExpiry');

    // This check should never fail, but it's good practice
    if (!user) {
        console.log(`Failed to re-fetch user by ID: ${baseUser._id}`);
        return NextResponse.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
    }

    // 3. Re-enable the 24-hour check (now it will work)
    if (user.lastPasswordReset) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (user.lastPasswordReset > twentyFourHoursAgo) {
        return NextResponse.json({ success: false, error: 'You can only request one password reset every 24 hours.' }, { status: 429 });
      }
    }
    
    // --- END OF FIX ---


    // 4. Generate a secure, unhashed token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // 5. Hash the token
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // 6. Set expiry (10 minutes)
    const tokenExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // 7. Save to the 'user' object (which now correctly has all fields)
    user.resetToken = hashedToken;
    user.resetTokenExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    // 8. Create reset URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

    // 9. Create email HTML
    const emailHtml = createEmailHtml(user.name, resetUrl);

    // 10. Send email
    await sendEmail({
      to: user.email,
      subject: 'Your Password Reset Link',
      html: emailHtml,
    });

    // 11. Return generic success message
    return NextResponse.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });

  } catch (error: unknown) {
    console.error('[FORGOT_PASSWORD_API_ERROR]', error);
    const message = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return NextResponse.json({ success: false, error: "An error occurred. Please try again later." }, { status: 500 });
  }
}