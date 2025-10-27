// src/components/ui/Input.tsx
import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-400">
        {label}
      </label>
      <input
        id={id}
        className="mt-1 block w-full rounded-lg border-gray-700 bg-gray-900 text-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm transition-colors duration-200"
        {...props}
      />
    </div>
  );
};

export default Input;