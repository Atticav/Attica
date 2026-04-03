import { cn } from '@/lib/utils'
import { type InputHTMLAttributes, forwardRef, type ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      icon,
      iconPosition = 'left',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="font-inter text-sm font-medium text-brand-text"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-lg border font-lora text-sm text-brand-text',
              'bg-brand-bg placeholder:text-brand-muted',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent',
              error
                ? 'border-brand-error focus:ring-brand-error/50'
                : 'border-brand-border',
              icon && iconPosition === 'left' ? 'pl-10 pr-4 py-3' : 'px-4 py-3',
              icon && iconPosition === 'right' ? 'pl-4 pr-10 py-3' : '',
              className
            )}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted">
              {icon}
            </span>
          )}
        </div>
        {error && (
          <p className="font-inter text-xs text-brand-error">{error}</p>
        )}
        {hint && !error && (
          <p className="font-inter text-xs text-brand-muted">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
