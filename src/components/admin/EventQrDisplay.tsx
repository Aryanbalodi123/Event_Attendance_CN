// src/components/admin/EventQrDisplay.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import QRCode from 'qrcode';

interface EventQrDisplayProps {
  eventId: string;
  eventName: string;
}

const EventQrDisplay: React.FC<EventQrDisplayProps> = ({ 
  eventId, 
  eventName 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && eventId) {
      // The data in the QR code is the event's ID
      QRCode.toCanvas(canvasRef.current, eventId, {
        width: 280,
        margin: 2,
        color: {
          dark: '#000000', // Black dots
          light: '#FFFFFF', // White background
        },
      }, (error) => {
        if (error) console.error('Error generating event QR code: ', error);
      });
    }
  }, [eventId]);

  return (
    <div className="flex flex-col items-center p-8 bg-white border border-gray-200 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{eventName}</h2>
      <p className="text-lg text-orange-600 mb-4">Event Check-in Code</p>
      
      <div className="bg-white p-4 rounded-lg border border-gray-300">
        <canvas ref={canvasRef} />
      </div>
      
      <p className="mt-6 text-gray-600 text-center max-w-xs">
        Have students scan this QR code with their device to mark their attendance.
      </p>
    </div>
  );
};

export default EventQrDisplay;