import { SignJWT, jwtVerify, JWTPayload } from 'jose'; // Import JWTPayload
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const secretKey = process.env.JWT_SECRET;

if (!secretKey) {
  throw new Error('JWT_SECRET is not set in environment variables.');
}

const key = new TextEncoder().encode(secretKey);

// FIX: Type the payload more specifically than 'any'
export async function encrypt(payload: JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    // Consider a shorter expiration for security, e.g., '1h' or '15m' depending on needs
    .setExpirationTime('1d') // Token expires in 1 day
    .sign(key);
}

// FIX: Define the expected shape of the decrypted payload
// Adjust this interface based on what you store in createSession
interface DecryptedPayload extends JWTPayload {
  userId: string;
  role: string;
  name: string;
  email: string;
  expires?: Date | number; // jose uses number for expiration time ('exp')
}

// FIX: Change return type from 'any' to the specific payload type or null
export async function decrypt(input: string): Promise<DecryptedPayload | null> {
  try {
    const { payload } = await jwtVerify<DecryptedPayload>(input, key, { // Use generic type
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return null; // Return null on verification failure
  }
}

export async function createSession(userId: string, role: string, name: string, email: string) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
  // Ensure the payload matches DecryptedPayload (or JWTPayload if using default claims)
  const sessionPayload: DecryptedPayload = { userId, role, name, email, expires: expires.getTime() / 1000 }; // Use numeric timestamp for 'exp'
  const session = await encrypt(sessionPayload);

  const cookieStore = await cookies();

  cookieStore.set('session', session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    // Consider adding SameSite=Lax or SameSite=Strict for CSRF protection
    sameSite: 'lax',
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set('session', '', { expires: new Date(0), path: '/' });
}

// Return type matches decrypt function
export async function getSession(): Promise<DecryptedPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) return null;
  return await decrypt(sessionCookie);
}

// This function refreshes the cookie, but doesn't strictly need to return the payload
export async function updateSession(request: NextRequest): Promise<NextResponse | null> {
  const sessionCookie = request.cookies.get('session')?.value;
  if (!sessionCookie) return null;

  // Re-verify the session to ensure it's still valid
  const parsed = await decrypt(sessionCookie);
  if (!parsed) {
    // Optionally clear the invalid cookie
    const response = NextResponse.next();
    response.cookies.set('session', '', { expires: new Date(0), path: '/' });
    return response; // Or just return null if no response modification needed
  }

  // Refresh the cookie's expiration time
  const newExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // Extend by 1 day from now
  const res = NextResponse.next();
  res.cookies.set({
    name: 'session',
    value: sessionCookie, // Keep the same token, just update expiry
    expires: newExpires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax', // Add SameSite here too
  });
  return res;
}