'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { X, CheckCircle, XCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose?: () => void
  isVisible?: boolean
}

const typeConfig: Record<
  ToastType,
  { icon: ReactNode; classes: string }
> = {
  success: {
    icon: <CheckCircle size={18} className="text-brand-success" />,
    classes: 'border-brand-success/30 bg-white',
  },
  error: {
    icon: <XCircle size={18} className="text-brand-error" />,
    classes: 'border-brand-error/30 bg-white',
  },
  info: {
    icon: <Info size={18} className="text-brand-gold" />,
    classes: 'border-brand-gold/30 bg-white',
  },
}

export function Toast({
  message,
  type = 'info',
  duration = 4000,
  onClose,
  isVisible = true,
}: ToastProps) {
  const [visible, setVisible] = useState(isVisible)
  const config = typeConfig[type]

  useEffect(() => {
    setVisible(isVisible)
  }, [isVisible])

  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(() => {
      setVisible(false)
      onClose?.()
    }, duration)
    return () => clearTimeout(timer)
  }, [visible, duration, onClose])

  if (!visible) return null

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-lg border shadow-card',
        'max-w-sm w-full animate-in slide-in-from-right-4 fade-in duration-300',
        config.classes
      )}
    >
      <span className="mt-0.5 flex-shrink-0">{config.icon}</span>
      <p className="font-lora text-sm text-brand-text flex-1">{message}</p>
      <button
        onClick={() => {
          setVisible(false)
          onClose?.()
        }}
        className="flex-shrink-0 text-brand-muted hover:text-brand-text transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  )
}

// ===== CONTAINER DE TOASTS =====
interface ToastItem {
  id: string
  message: string
  type: ToastType
}

interface ToastContainerProps {
  toasts: ToastItem[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  )
}

export default Toast
