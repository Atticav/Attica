import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  className?: string
  label?: string
  showPercentage?: boolean
}

export default function ProgressBar({
  value,
  className,
  label,
  showPercentage = false,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="font-inter text-xs text-brand-text">{label}</span>
          )}
          {showPercentage && (
            <span className="font-inter text-xs text-brand-muted ml-auto">
              {Math.round(clamped)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full h-2 bg-brand-hover rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-gold rounded-full transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
