import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-inter font-medium text-[#4A4A4A]">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2.5 bg-white border rounded-lg font-lora text-sm text-[#4A4A4A] placeholder:text-[#9C9C9C] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C4A97D] focus:border-transparent ${
          error ? 'border-[#C17B6E]' : 'border-[#E5DDD5] hover:border-[#C4A97D]'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs font-inter text-[#C17B6E]">{error}</p>}
      {helperText && !error && <p className="text-xs font-inter text-[#9C9C9C]">{helperText}</p>}
    </div>
  );
}
