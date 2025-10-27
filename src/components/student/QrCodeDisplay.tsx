// src/components/student/QrCodeDisplay.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import QRCode from 'qrcode';

interface QrCodeDisplayProps {
  participantId: string;
  participantName: string;
  eventName: string;
}

const QrCodeDisplay: React.FC<QrCodeDisplayProps> = ({ 
  participantId, 
  participantName,
  eventName 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && participantId) {
      // The only data in the QR code is the participant's ID
      QRCode.toCanvas(canvasRef.current, participantId, {
        width: 280,
        margin: 2,
        color: {
          dark: '#FFFFFF', // White dots
          light: '#00000000', // Transparent background
        },
      }, (error) => {
        if (error) console.error('Error generating QR code: ', error);
      });
    }
  }, [participantId]);

  return (
    <div className="flex flex-col items-center p-8 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-2">Welcome, {participantName}!</h2>
      <p className="text-lg text-orange-500 mb-4">{eventName}</p>
      
      <div className="bg-black p-4 rounded-lg border border-gray-700">
        <canvas ref={canvasRef} />
      </div>
      
      <p className="mt-6 text-gray-400 text-center max-w-xs">
        Present this QR code to the event staff to be scanned for attendance.
      </p>
    </div>
  );
};

export default QrCodeDisplay;