// src/app/admin/scan/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
// FIX 1: Corrected typo: 'QrcodeSuccessCallback' (lowercase 'c')
// FIX 2: Added 'Html5QrcodeResult' to type the result parameter
import { Html5QrcodeScanner, QrcodeSuccessCallback, Html5QrcodeResult } from 'html5-qrcode';
import { CheckCircle, XCircle } from 'lucide-react';
 // This import will now work after you move the components folder
import Spinner from '@components/ui/Spinner'; 
import { IParticipant } from '@lib/types';

// This component wraps the scanner logic
const ScannerComponent = () => {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'success' | 'error' | 'loading' | null>(null);
  const [scannedData, setScannedData] = useState<string | null>(null);
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // FIX 3: Explicitly typed parameters to remove 'any' error
  const handleScanSuccess: QrcodeSuccessCallback = async (
    decodedText: string, 
    decodedResult: Html5QrcodeResult
  ) => {
    // Prevent re-scanning the same code while one is processing
    if (decodedText === scannedData || status === 'loading') {
      return;
    }

    const newScanData = decodedText;
    setScannedData(newScanData); // Mark this data as scanned
    setStatus('loading');
    setMessage('Processing...');

    try {
      // We assume the QR code contains the participant's ID
      const participantId = newScanData;

      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      const participant: IParticipant = data.data;
      setStatus('success');
      setMessage(`Welcome, ${participant.name}! Attendance marked.`);

    } catch (err) {
      setStatus('error');
      setMessage(`Scan Failed: ${(err as Error).message}`);
    }

    // Reset after a few seconds
    setTimeout(() => {
      setStatus(null);
      setMessage('');
      setScannedData(null); 
    }, 4000);
  };

  const handleScanError = (errorMessage: string) => {
    // This callback is called for non-fatal errors, we can ignore them
  };

  useEffect(() => {
    if (scannerRef.current) {
      return;
    }

    // This creates the scanner and renders it into the div with id "qr-reader-container"
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader-container",
      {
        fps: 10, 
        qrbox: { width: 250, height: 250 }, 
        rememberLastUsedCamera: true,
        supportedScanTypes: [0], // 0 = SCAN_TYPE_CAMERA
      },
      false // verbose logs
    );

    scannerRef.current = html5QrcodeScanner;
    html5QrcodeScanner.render(handleScanSuccess, handleScanError);

    // Cleanup function to stop the camera when the component is unmounted
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner.", error);
        });
        scannerRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  return (
    <div className="max-w-md mx-auto">
      {/* This div is where the scanner's video feed will appear */}
      <div id="qr-reader-container" className="w-full rounded-2xl overflow-hidden border-4 border-gray-800 mb-4"></div>

      {/* Status Message Display */}
      <div className="h-20">
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center text-orange-500">
            <Spinner />
            <p className="mt-2">{message}</p>
          </div>
        )}
        {status === 'success' && (
          <div className="flex flex-col items-center justify-center text-green-400 p-4 bg-green-900/50 rounded-lg">
            <CheckCircle size={32} />
            <p className="mt-2 font-semibold text-center">{message}</p>
          </div>
        )}
        {status === 'error' && (
          <div className="flex flex-col items-center justify-center text-red-400 p-4 bg-red-900/50 rounded-lg">
            <XCircle size={32} />
            <p className="mt-2 font-semibold text-center">{message}</p>
          </div>
        )}
        {status === null && (
          <p className="text-gray-400 text-center">Point the camera at a participant's QR code.</p>
        )}
      </div>
    </div>
  );
};


export default function ScanPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6 text-center">
        Scan Attendance
      </h1>
      <ScannerComponent />
    </div>
  );
}