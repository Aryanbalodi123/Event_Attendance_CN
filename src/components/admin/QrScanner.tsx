'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, QrcodeSuccessCallback, Html5QrcodeResult } from 'html5-qrcode';
import { CheckCircle, XCircle } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import Toast from '@/components/ui/Toast';
import { IParticipant } from '@/lib/types';

interface QrScannerProps {
  eventId: string;
  onSuccess: (participant: IParticipant) => void;
  containerId?: string;
}

const QrScanner: React.FC<QrScannerProps> = ({ eventId, onSuccess }) => {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'success' | 'error' | 'loading' | null>(null);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Use a unique container id per instance to avoid collisions when multiple
  // scanner components are mounted on the page (this was causing two
  // scanners to appear when the same id was reused).
  const containerIdRef = useRef<string>(`qr-reader-${Math.random().toString(36).slice(2)}`);

  const handleScanSuccess: QrcodeSuccessCallback = async (
    decodedText: string, 
    decodedResult: Html5QrcodeResult
  ) => {
    // Prevent re-scanning the same code while one is processing
    if (decodedText === scannedData || status === 'loading') {
      return;
    }

    const participantId = decodedText;
    setScannedData(participantId);
    setStatus('loading');
    setMessage('Processing...');

    try {
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, eventId }), // Pass both IDs
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      const participant: IParticipant = data.data;
  setStatus('success');
  setMessage(data.message || `Welcome, ${participant.name}!`);
  setToastMessage(data.message || `Welcome, ${participant.name}!`);
  setShowToast(true);
      
      // Report success to the parent component
      onSuccess(participant);

    } catch (err) {
      setStatus('error');
      setMessage(`Scan Failed: ${(err as Error).message}`);
    }

    // Reset after a few seconds to allow scanning again
    setTimeout(() => {
      setStatus(null);
      setMessage('');
      setScannedData(null);
    }, 4000);
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
    <div className="max-w-md mx-auto">
      {/* This div is the container where html5-qrcode will render the video feed */}
      <div id={containerIdRef.current} className="w-full rounded-2xl overflow-hidden border-4 border-gray-800 mb-4"></div>

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
        {status === null && (
          <p className="text-gray-400 text-center">Point camera at a participant's QR code.</p>
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

export default QrScanner;
