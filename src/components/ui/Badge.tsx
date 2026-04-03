import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'blue' | 'purple' | 'orange' | 'brown' | 'olive' | 'gray';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[#FAF6F3] text-[#8B7355] border border-[#E5DDD5]',
  success: 'bg-green-50 text-[#7B9E6B] border border-green-200',
  warning: 'bg-amber-50 text-[#D4A853] border border-amber-200',
  error: 'bg-red-50 text-[#C17B6E] border border-red-200',
  blue: 'bg-blue-50 text-blue-700 border border-blue-200',
  purple: 'bg-purple-50 text-purple-700 border border-purple-200',
  orange: 'bg-orange-50 text-orange-700 border border-orange-200',
  brown: 'bg-[#F5EDE8] text-[#6B5B45] border border-[#E5DDD5]',
  olive: 'bg-lime-50 text-lime-700 border border-lime-200',
  gray: 'bg-gray-50 text-gray-600 border border-gray-200',
};

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-inter font-medium ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
