// src/components/ui/Toast.tsx
'use client';

import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  let bgColor = 'bg-green-600';
  if (type === 'error') bgColor = 'bg-red-600';
  if (type === 'info') bgColor = 'bg-blue-600';

  return (
    <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-lg shadow-lg text-white font-semibold ${bgColor}`}>
      {message}
    </div>
  );
};

export default Toast;
