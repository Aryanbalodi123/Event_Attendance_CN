// src/components/ui/Select.tsx
'use client';

import React from 'react';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  children: React.ReactNode;
};

const Select: React.FC<SelectProps> = ({ label, id, children, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-400">
        {label}
      </label>
      <select
        id={id}
        className="mt-1 block w-full rounded-lg border-gray-700 bg-gray-900 text-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm transition-colors duration-200"
        {...props}
      >
        {children}
      </select>
    </div>
  );
};

export default Select;