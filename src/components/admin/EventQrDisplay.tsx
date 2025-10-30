// src/components/admin/EventQrDisplay.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import QRCode from 'qrcode';

interface EventQrDisplayProps {
  eventId: string;
}

const EventQrDisplay: React.FC<EventQrDisplayProps> = ({ eventId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && eventId) {
      // The data in the QR code is the event's ID
      QRCode.toCanvas(
        canvasRef.current,
        eventId,
        {
          width: 256, // Slightly smaller to fit well
          margin: 2,
          color: {
            dark: '#000000', // Black dots
            light: '#FFFFFF', // White background
          },
        },
        (error) => {
          if (error) console.error('Error generating event QR code: ', error);
        },
      );
    }
  }, [eventId]);

  return (
    // This white background is *required* for QR scanners to work.
    // The component is now *just* this scannable block.
    <div className="bg-white p-4 rounded-2xl border-4 border-gray-300 inline-block shadow-lg">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default EventQrDisplay;