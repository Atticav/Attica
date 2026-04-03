import { cn } from '@/lib/utils'
import { type HTMLAttributes } from 'react'

type BadgeVariant =
  | 'gold'
  | 'brown'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  gold: 'bg-brand-gold/15 text-brand-gold-dark border-brand-gold/30',
  brown: 'bg-brand-brown/10 text-brand-brown border-brand-brown/30',
  success: 'bg-brand-success/15 text-brand-success border-brand-success/30',
  warning: 'bg-brand-warning/15 text-brand-warning border-brand-warning/30',
  error: 'bg-brand-error/15 text-brand-error border-brand-error/30',
  neutral: 'bg-brand-hover text-brand-muted border-brand-border',
}

export default function Badge({
  className,
  variant = 'neutral',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5',
        'font-inter text-xs font-medium',
        'rounded-full border',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
