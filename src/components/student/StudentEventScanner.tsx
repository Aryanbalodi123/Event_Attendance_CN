// src/components/student/StudentEventScanner.tsx
'use client';

// FIX: Import useCallback
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5QrcodeScanner, QrcodeSuccessCallback } from 'html5-qrcode';
import { CheckCircle, XCircle } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import Toast from '@/components/ui/Toast';

interface StudentEventScannerProps {
  participantId: string;
  participantName: string;
  email: string;
  rollNumber: string;
  eventId: string;
}

const StudentEventScanner: React.FC<StudentEventScannerProps> = ({ participantId, participantName, email, rollNumber }) => {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'success' | 'error' | 'loading' | null>(null);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  // FIX: Used crypto.randomUUID for a more robust unique ID if available in the environment
  const containerIdRef = useRef<string>(`qr-reader-student-${globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : Math.random().toString(36).slice(2)}`);

  // FIX: Wrap handleScanSuccess in useCallback
  const handleScanSuccess: QrcodeSuccessCallback = useCallback(async (
    decodedText: string
    // FIX: Removed unused 'decodedResult'
    /* decodedResult: Html5QrcodeResult */
  ) => {
    // Prevent re-scanning the same code while one is processing
    // Use function form of setStatus to avoid stale state dependency
    let shouldProcess = true;
    setStatus(currentStatus => {
        if (decodedText === scannedData || currentStatus === 'loading') {
            shouldProcess = false;
        }
        return currentStatus === 'loading' ? currentStatus : 'loading'; // Set loading only if not already processing
    });

    if (!shouldProcess) return;


    const eventId = decodedText; // The scanned data is the Event ID
    setScannedData(eventId);
    setMessage('Processing check-in...');

    try {
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          participantId,
          eventId,
          name: participantName,
          email,
          rollNumber
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) { // Check res.ok as well
        throw new Error(data.error || 'Check-in API call failed');
       }

      setStatus('success');
      const successMsg = data.message || `Checked in successfully!`;
      setMessage(successMsg);
      setToastMessage(successMsg);
      setShowToast(true);

      // Stop the scanner on success
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner on success.", error);
        });
        scannerRef.current = null; // Ensure scanner instance is cleared
      }

    } catch (err: unknown) { // Use unknown type
      setStatus('error');
      setMessage(`Check-in Failed: ${err instanceof Error ? err.message : 'Unknown error'}`);

      // Reset after a few seconds ONLY on error to allow scanning again
      setTimeout(() => {
        setStatus(null);
        setMessage('');
        setScannedData(null);
      }, 4000);
    }
   // FIX: Add dependencies for useCallback
  }, [participantId, scannedData, participantName, email, rollNumber]);

  // FIX: Removed unused 'errorMessage'
  const handleScanError = (/* errorMessage: string */) => { /* Ignore non-fatal errors */ };

  useEffect(() => {
    // Check if scanner element exists before creating scanner
    const scannerElement = document.getElementById(containerIdRef.current);
    if (!scannerElement) {
        console.error(`Scanner container element with ID ${containerIdRef.current} not found.`);
        return;
    }
    

    // Only create scanner if it doesn't exist and status is not 'success'
    // This prevents re-rendering scanner after successful scan
    if (!scannerRef.current && status !== 'success') {
         const html5QrcodeScanner = new Html5QrcodeScanner(
            containerIdRef.current,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              rememberLastUsedCamera: true,
              supportedScanTypes: [0], // SCAN_TYPE_CAMERA
            },
            false // verbose
          );

         scannerRef.current = html5QrcodeScanner;
         html5QrcodeScanner.render(handleScanSuccess, handleScanError);
    }

    // Cleanup function to stop the scanner when the component unmounts
    // OR if the status becomes 'success' (scanner cleared internally then)
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner on cleanup.", error);
        });
        scannerRef.current = null;
      }
    };
  // FIX: Add handleScanSuccess and status to dependency array
  }, [handleScanSuccess, status]); // Added handleScanSuccess and status

  return (
    <div className="w-full max-w-md mx-auto">

      {/* Show scanner container only if not successful */}
      {status !== 'success' && (
        <div id={containerIdRef.current} className="w-full rounded-2xl overflow-hidden border-4 border-gray-800 mb-4 min-h-[300px]">
          {/* Content inside is rendered by html5-qrcode library */}
        </div>
      )}

      {/* Status Message Display */}
      <div className="h-20 flex items-center justify-center"> {/* Centering content */}
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center text-orange-500">
            <Spinner />
            <p className="mt-2 text-sm">{message}</p>
          </div>
        )}
        {status === 'error' && (
          <div className="flex flex-col items-center justify-center text-red-400 p-4 bg-red-900/50 rounded-lg w-full">
            <XCircle size={32} />
            <p className="mt-2 font-semibold text-center text-sm">{message}</p>
          </div>
        )}
         {status === 'success' && (
          <div className="flex flex-col items-center justify-center text-green-400 p-4 bg-green-900/50 rounded-lg w-full">
            <CheckCircle size={32} />
            <p className="mt-2 font-semibold text-center text-sm">{message}</p>
          </div>
        )}
        {status === null && (
          <p className="text-gray-400 text-center text-sm">
            {/* FIX: Escaped apostrophe */}
            Ready to scan, {participantName}.<br/>Point your camera at the event&apos;s QR code.
          </p>
        )}
      </div>

      {/* Success Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default StudentEventScanner;