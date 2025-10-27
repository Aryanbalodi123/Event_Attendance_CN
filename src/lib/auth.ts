import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const secretKey = process.env.JWT_SECRET;

// CRITICAL: Check for the secret key at the module level.
if (!secretKey) {
  throw new Error('JWT_SECRET is not set in environment variables.');
}

const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  // No need to check for secretKey here, it's checked above
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d') // Token expires in 1 day
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  // No need to check for secretKey here, it's checked above
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return null;
  }
}

export async function createSession(userId: string, role: string, name: string, email: string) {
  // Encrypt the session data
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
  const session = await encrypt({ userId, role, name, email, expires });

  // FIX: Added 'await' as suggested by the error
  const cookieStore = await cookies();
  
  // Save the session in a cookie
  cookieStore.set('session', session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

export async function clearSession() {
  // FIX: Added 'await' as suggested by the error
  const cookieStore = await cookies();
  
  // Expire the cookie
  cookieStore.set('session', '', { expires: new Date(0), path: '/' });
}

export async function getSession() {
  // FIX: Added 'await' as suggested by the error
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) return null;
  return await decrypt(sessionCookie);
}

export async function updateSession(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;
  if (!sessionCookie) return null;

  // Re-verify and refresh the session
  const parsed = await decrypt(sessionCookie);
  if (!parsed) {
    return null;
  }

  // Refresh the cookie's expiration time
  const res = NextResponse.next();
  res.cookies.set({
    name: 'session',
    value: sessionCookie,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
    path: '/',
  });
  return res;
}