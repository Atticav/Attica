import { cn } from '@/lib/utils'
import { type HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export default function Card({
  className,
  padding = 'md',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-brand shadow-soft border border-brand-border',
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
