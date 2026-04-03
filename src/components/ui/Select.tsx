import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ label, error, options, placeholder, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-inter font-medium text-[#4A4A4A]">{label}</label>
      )}
      <select
        className={`w-full px-4 py-2.5 bg-white border rounded-lg font-lora text-sm text-[#4A4A4A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C4A97D] focus:border-transparent cursor-pointer ${
          error ? 'border-[#C17B6E]' : 'border-[#E5DDD5] hover:border-[#C4A97D]'
        } ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs font-inter text-[#C17B6E]">{error}</p>}
    </div>
  );
}
