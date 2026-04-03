import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({ label, error, helperText, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-inter font-medium text-[#4A4A4A]">{label}</label>
      )}
      <textarea
        className={`w-full px-4 py-2.5 bg-white border rounded-lg font-lora text-sm text-[#4A4A4A] placeholder:text-[#9C9C9C] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C4A97D] focus:border-transparent resize-vertical min-h-[100px] ${
          error ? 'border-[#C17B6E]' : 'border-[#E5DDD5] hover:border-[#C4A97D]'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs font-inter text-[#C17B6E]">{error}</p>}
      {helperText && !error && <p className="text-xs font-inter text-[#9C9C9C]">{helperText}</p>}
    </div>
  );
}
