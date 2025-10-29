"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import Spinner from '@/components/ui/Spinner';
import Link from 'next/link'; // <-- IMPORT LINK

type Role = 'student' | 'admin';

// Defined SignupBody type
type SignupBody = {
  // ... (rest of type)
  role: Role;
  name: string;
  email: string;
  password: string;
  year?: string | number;
  group?: string;
  rollNumber?: string;
  team?: string;
  adminRole?: string;
};


export default function LoginPage() {
  const router = useRouter();

  const [role, setRole] = useState<Role>('student');

  // ... (rest of your state)
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [group, setGroup] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [team, setTeam] = useState('');
  const [adminRole, setAdminRole] = useState('');
  const [isLoginView, setIsLoginView] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ... (rest of your useEffects and handlers)
  useEffect(() => {
     const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      if (link.parentNode) document.head.removeChild(link);
    };
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: identifier,
          password,
          role,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Login failed');
      }

      if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/student');
      }

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    setIsLoading(true);
    setError(null);

    let body: SignupBody = {
      role,
      name,
      email: identifier,
      password,
    };

    if (role === 'student') {
      body = { ...body, year: year || undefined, group: group || undefined };
    } else {
      body = { ...body, rollNumber: rollNumber || undefined, team: team || undefined, adminRole: adminRole || undefined };
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Sign up failed');
      }

      if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/student');
      }

    } catch (err: unknown) {
       setError(err instanceof Error ? err.message : 'An unexpected signup error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoginView) {
      handleLogin();
    } else {
      handleSignup();
    }
  };

  const toggleView = (view: 'login' | 'signup') => {
    setIsLoginView(view === 'login');
    setError(null);
    setIdentifier('');
    setPassword('');
    setName('');
    setYear('');
    setGroup('');
    setRollNumber('');
    setTeam('');
    setAdminRole('');
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ fontFamily: '"Poppins", sans-serif' }}>
      <div className="absolute inset-0 bg-linear-to-b from-black via-zinc-900 to-orange-950" />
      <div className="relative z-10 min-h-screen flex flex-col">
         <nav className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <div className="w-5 h-5 bg-orange-600 rounded" />
            </div>
            <span className="text-white font-semibold text-xl">CN&apos;s Events Attendance Portal</span>
          </div>
          <button
            type="button"
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition flex items-center space-x-2"
          >
            <span>Contact Us</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </nav>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <form onSubmit={handleSubmit} className="bg-black bg-opacity-60 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md border border-orange-900 border-opacity-50">
             <div className="flex w-full mb-6">
               <button
                 type="button"
                 onClick={() => setRole('student')}
                 className={`w-1/2 py-3 font-medium transition ${
                   role === 'student'
                     ? 'bg-orange-600 text-white rounded-l-lg'
                     : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700 rounded-l-lg'
                 }`}
               >
                 Student
               </button>
               <button
                 type="button"
                 onClick={() => setRole('admin')}
                 className={`w-1/2 py-3 font-medium transition ${
                   role === 'admin'
                     ? 'bg-orange-600 text-white rounded-r-lg'
                     : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700 rounded-r-lg'
                 }`}
               >
                 Admin
               </button>
             </div>

            <h2 className="text-white text-2xl font-semibold mb-6 text-center">
              {isLoginView
                ? (role === 'admin' ? 'Admin Login' : 'Student Login')
                : (role === 'admin' ? 'Admin Signup' : 'Student Signup')
              }
            </h2>

            <div className="space-y-4">
              {/* ... (rest of form inputs) ... */}
              {!isLoginView && (
                 <div>
                   <label htmlFor="name" className="sr-only">Full Name</label>
                   <input
                     id="name"
                     name="name"
                     type="text"
                     placeholder="Full Name"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     className="w-full bg-zinc-900 bg-opacity-50 text-white placeholder-gray-500 px-4 py-3 rounded-lg border border-orange-900 border-opacity-30 focus:border-orange-500 focus:outline-none transition"
                     required
                   />
                 </div>
               )}
                 <div>
                 <label htmlFor="identifier" className="sr-only">Email</label>
                 <input
                   id="identifier"
                   name="identifier"
                   type="email"
                   placeholder="Email Address"
                   value={identifier}
                   onChange={(e) => setIdentifier(e.target.value)}
                   className="w-full bg-zinc-900 bg-opacity-50 text-white placeholder-gray-500 px-4 py-3 rounded-lg border border-orange-900 border-opacity-30 focus:border-orange-500 focus:outline-none transition"
                   required
                 />
               </div>
               <div>
                 <label htmlFor="password" className="sr-only">Password</label>
                 <input
                   id="password"
                   name="password"
                   type="password"
                   placeholder="Password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full bg-zinc-900 bg-opacity-50 text-white placeholder-gray-500 px-4 py-3 rounded-lg border border-orange-900 border-opacity-30 focus:border-orange-500 focus:outline-none transition"
                   required
                 />
               </div>
                {role === 'student' && !isLoginView && (
                 <>
                   <div>
                     <label htmlFor="year" className="sr-only">Year</label>
                     <input
                       id="year"
                       name="year"
                       type="number"
                       placeholder="Year (e.g., 1, 2, 3)"
                       value={year}
                       onChange={(e) => setYear(e.target.value)}
                       className="w-full bg-zinc-900 bg-opacity-50 text-white placeholder-gray-500 px-4 py-3 rounded-lg border border-orange-900 border-opacity-30 focus:border-orange-500 focus:outline-none transition"
                     />
                   </div>
                   <div>
                     <label htmlFor="group" className="sr-only">Group</label>
                     <input
                       id="group"
                       name="group"
                       type="text"
                       placeholder="Group (e.g., G1, G2)"
                       value={group}
                       onChange={(e) => setGroup(e.target.value)}
                       className="w-full bg-zinc-900 bg-opacity-50 text-white placeholder-gray-500 px-4 py-3 rounded-lg border border-orange-900 border-opacity-30 focus:border-orange-500 focus:outline-none transition"
                     />
                   </div>
                 </>
               )}
                {role === 'admin' && !isLoginView && (
                 <>
                   <div>
                     <label htmlFor="rollNumber" className="sr-only">Roll Number</label>
                     <input
                       id="rollNumber"
                       name="rollNumber"
                       type="text"
                       placeholder="Roll Number"
                       value={rollNumber}
                       onChange={(e) => setRollNumber(e.target.value)}
                       className="w-full bg-zinc-900 bg-opacity-50 text-white placeholder-gray-500 px-4 py-3 rounded-lg border border-orange-900 border-opacity-30 focus:border-orange-500 focus:outline-none transition"
                     />
                   </div>
                   <div>
                     <label htmlFor="team" className="sr-only">Team</label>
                     <input
                       id="team"
                       name="team"
                       type="text"
                       placeholder="Team (e.g., Core, Tech)"
                       value={team}
                       onChange={(e) => setTeam(e.target.value)}
                       className="w-full bg-zinc-900 bg-opacity-50 text-white placeholder-gray-500 px-4 py-3 rounded-lg border border-orange-900 border-opacity-30 focus:border-orange-500 focus:outline-none transition"
                     />
                   </div>
                   <div>
                     <label htmlFor="adminRole" className="sr-only">Admin Role</label>
                     <input
                       id="adminRole"
                       name="adminRole"
                       type="text"
                       placeholder="Role in Team (e.g., Manager)"
                       value={adminRole}
                       onChange={(e) => setAdminRole(e.target.value)}
                       className="w-full bg-zinc-900 bg-opacity-50 text-white placeholder-gray-500 px-4 py-3 rounded-lg border border-orange-900 border-opacity-30 focus:border-orange-500 focus:outline-none transition"
                     />
                   </div>
                 </>
               )}

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-medium transition h-12 flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? <Spinner size={24} /> : (isLoginView ? 'Login' : 'Sign Up')}
              </button>
            </div>

            {/* Footer Links */}
            <div className="mt-6 space-y-3 text-center">
              {/* --- FIX: UPDATED THIS LINK --- */}
              <Link href="/forgot-password" legacyBehavior>
                <a className="text-orange-400 hover:text-orange-300 text-sm block transition">
                  Forgot password?
                </a>
              </Link>
              {/* ------------------------- */}
              <p className="text-gray-400 text-sm">
                {isLoginView ? "Need a new account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => toggleView(isLoginView ? 'signup' : 'login')}
                  className="text-orange-400 hover:text-orange-300 transition bg-transparent border-none p-0"
                >
                  {isLoginView ? 'Sign up' : 'Login'}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}