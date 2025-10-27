// src/components/student/StudentEventScanner.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, QrcodeSuccessCallback, Html5QrcodeResult } from 'html5-qrcode';
import { CheckCircle, XCircle } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import Toast from '@/components/ui/Toast';

interface StudentEventScannerProps {
  participantId: string;
  participantName: string;
}

const StudentEventScanner: React.FC<StudentEventScannerProps> = ({ participantId, participantName }) => {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'success' | 'error' | 'loading' | null>(null);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const containerIdRef = useRef<string>(`qr-reader-student-${Math.random().toString(36).slice(2)}`);

  const handleScanSuccess: QrcodeSuccessCallback = async (
    decodedText: string, 
    decodedResult: Html5QrcodeResult
  ) => {
    // Prevent re-scanning the same code while one is processing
    if (decodedText === scannedData || status === 'loading') {
      return;
    }

    const eventId = decodedText; // The scanned data is the Event ID
    setScannedData(eventId);
    setStatus('loading');
    setMessage('Processing check-in...');

    try {
      // Use the same API endpoint as the admin scanner
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Pass both IDs, but this time participantId is from props
        // and eventId is from the scan
        body: JSON.stringify({ participantId, eventId }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setStatus('success');
      const successMsg = data.message || `Checked in successfully!`;
      setMessage(successMsg);
      setToastMessage(successMsg);
      setShowToast(true);
      
      // Stop the scanner on success
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner.", error);
        });
        scannerRef.current = null;
      }

    } catch (err) {
      setStatus('error');
      setMessage(`Check-in Failed: ${(err as Error).message}`);

      // Reset after a few seconds to allow scanning again
      setTimeout(() => {
        setStatus(null);
        setMessage('');
        setScannedData(null);
      }, 4000);
    }
  };

  const handleScanError = (errorMessage: string) => { /* Ignore errors */ };

  useEffect(() => {
    // Clean up any existing scanner first
    if (scannerRef.current) {
      scannerRef.current.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner.", error);
      });
      scannerRef.current = null;
    }

    // Create new scanner
    const html5QrcodeScanner = new Html5QrcodeScanner(
      containerIdRef.current,
      {
        fps: 10, 
        qrbox: { width: 250, height: 250 }, 
        rememberLastUsedCamera: true,
        supportedScanTypes: [0], // 0 = SCAN_TYPE_CAMERA
      },
      false // verbose
    );

    scannerRef.current = html5QrcodeScanner;
    
    // Start scanning
    html5QrcodeScanner.render(handleScanSuccess, handleScanError);

    // Cleanup function to stop the scanner when the component unmounts
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner.", error);
        });
        scannerRef.current = null;
      }
    };
  }, []); // Empty dependency array since we want this to run only once

  return (
    <div className="w-full max-w-md mx-auto">
      
      {/* Show scanner only if not successful */}
      {status !== 'success' && (
        <div id={containerIdRef.current} className="w-full rounded-2xl overflow-hidden border-4 border-gray-800 mb-4"></div>
      )}

      {/* Status Message Display */}
      <div className="h-20">
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center text-orange-500">
            <Spinner />
            <p className="mt-2">{message}</p>
          </div>
        )}
        {status === 'error' && (
          <div className="flex flex-col items-center justify-center text-red-400 p-4 bg-red-900/50 rounded-lg">
            <XCircle size={32} />
            <p className="mt-2 font-semibold text-center">{message}</p>
          </div>
        )}
         {status === 'success' && (
          <div className="flex flex-col items-center justify-center text-green-400 p-4 bg-green-900/50 rounded-lg">
            <CheckCircle size={32} />
            <p className="mt-2 font-semibold text-center">{message}</p>
          </div>
        )}
        {status === null && (
          <p className="text-gray-400 text-center">
            Ready to scan, {participantName}.<br/>Point your camera at the event's QR code.
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