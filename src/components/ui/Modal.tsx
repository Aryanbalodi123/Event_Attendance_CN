import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar } from 'lucide-react';
import { Calendar as ShadcnCalendar } from '@/components/ui/calendar';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop with enhanced blur */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Modal Panel */}
          <motion.div
            className="relative z-10 w-full max-w-2xl rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {/* Decorative gradient overlay */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500"></div>
            
            {/* Header */}
            <div className="relative flex items-center justify-between px-8 py-6 border-b border-slate-700/50 bg-slate-900/90 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white tracking-tight">{title}</h3>
              </div>
              <button
                onClick={onClose}
                className="group rounded-xl p-2.5 text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 bg-slate-900/50 backdrop-blur-sm">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Export the Modal component as default so other modules can import it
export default Modal;

// Demo Component (named export)
export function ModalDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Google Fonts Import */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        `}
      </style>

      <div className="text-center space-y-6">
        <div className="space-y-3">
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Enhanced Modal
          </h1>
          <p className="text-slate-400 text-lg max-w-md mx-auto">
            Modern design with glassmorphism, smooth animations, and integrated calendar
          </p>
        </div>
        
        <button
          onClick={() => setIsOpen(true)}
          className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          <span className="flex items-center gap-2">
            <Calendar className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            Open Calendar Modal
          </span>
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create Event">
  <div className="space-y-6">
    <div className="text-center space-y-2">
      <p className="text-slate-300 font-medium text-lg">
        Fill out event details
      </p>
      <p className="text-slate-500 text-sm">
        All fields are required
      </p>
    </div>

    {/* Inputs with visible borders */}
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Event Title"
        className="w-full bg-slate-900/60 text-white placeholder-slate-500 px-4 py-3 rounded-xl border border-slate-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 focus:outline-none transition-all duration-200"
      />

      <input
        type="text"
        placeholder="Event Description"
        className="w-full bg-slate-900/60 text-white placeholder-slate-500 px-4 py-3 rounded-xl border border-slate-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 focus:outline-none transition-all duration-200"
      />

      <input
        type="number"
        placeholder="Group (e.g. G11)"
        className="w-full bg-slate-900/60 text-white placeholder-slate-500 px-4 py-3 rounded-xl border border-slate-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 focus:outline-none transition-all duration-200"
      />
    </div>

    <div className="flex gap-3 pt-4">
      <button
        onClick={() => setIsOpen(false)}
        className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-600"
      >
        Cancel
      </button>
      <button
        onClick={() => setIsOpen(false)}
        className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
      >
        Save
      </button>
    </div>
  </div>
</Modal>

    </div>
  );
}