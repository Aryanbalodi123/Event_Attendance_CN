// src/components/ui/Spinner.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';

const Spinner = ({ size = 24 }: { size?: number }) => {
  return <Loader2 size={size} className="animate-spin text-orange-500" />;
};

export default Spinner;