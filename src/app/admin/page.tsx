"use client";

import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import StudentListItem from '@/components/StudentListItem';
// Your import might be different, ensure it points to your Student type
import { Student } from '@/src/app/api/check-in/route'; 

export default function AdminPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);
  // --- STATE FOR THE DYNAMIC QR CODE ---
  const [qrCodeValue, setQrCodeValue] = useState('loading...');

  // --- NEW FUNCTION TO FETCH THE QR CODE ---
  const fetchQrCode = async () => {
    try {
        const response = await fetch('/api/qr-code');
        const data = await response.json();
        setQrCodeValue(data.qrValue);
    } catch (err) {
        console.error("Failed to fetch QR code", err);
        setQrCodeValue('error');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/check-in');
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      const data: Student[] = await response.json();
      setStudents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    // Fetch students and QR code immediately
    fetchStudents();
    fetchQrCode();

    // Set up intervals for both
    const studentIntervalId = setInterval(fetchStudents, 3000);
    const qrIntervalId = setInterval(fetchQrCode, 4000); // Fetches a new code every 4s

    // Cleanup on component unmount
    return () => {
      clearInterval(studentIntervalId);
      clearInterval(qrIntervalId);
    };
  }, []);

  return (
    <main className="bg-gray-50 min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center">
            <h2 className="text-xl font-semibold mb-4">Scan to Check-In</h2>
            <div className="flex justify-center p-4 bg-gray-100 rounded-md h-[288px] w-[288px] mx-auto items-center">
              {/* --- DYNAMIC QR CODE RENDER --- */}
              <QRCodeCanvas value={qrCodeValue} size={256} level="H" />
            </div>
            <p className="mt-4 text-sm text-gray-500">
              This code changes automatically for security.
            </p>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Checked-In Students ({students.length})
            </h2>
            {error && <p className="text-red-500">Error: {error}</p>}
            <div className="space-y-3">
              {students.length > 0 ? (
                students.map((student) => (
                  <StudentListItem key={student.rollNumber} student={student} />
                ))
              ) : (
                <div className="text-center py-10 bg-white rounded-lg border border-dashed">
                  <p className="text-gray-500">No students have checked in yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}