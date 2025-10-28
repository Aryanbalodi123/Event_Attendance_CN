"use client";

import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'default' | 'icon';
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className = '', variant = 'primary', size = 'default', ...props }, ref) => {
    const baseStyle =
      'rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black';

    const variants = {
      primary: 'bg-orange-500 text-black hover:bg-orange-600 focus:ring-orange-500',
      secondary: 'bg-gray-800 text-gray-300 hover:bg-gray-700 focus:ring-orange-500',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 hover:text-gray-900',
    } as const;

    const sizes = {
      default: 'px-4 py-2',
      icon: 'p-2',
    } as const;

    const variantClass = variants[variant] ?? variants.primary;
    const sizeClass = sizes[size] ?? sizes.default;

    return (
      <button
        ref={ref}
        className={`${baseStyle} ${variantClass} ${sizeClass} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;