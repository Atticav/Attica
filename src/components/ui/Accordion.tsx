'use client'

import { useState, useRef, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccordionItem {
  id: string
  title: string
  icon?: ReactNode
  children: ReactNode
}

interface AccordionProps {
  items: AccordionItem[]
  allowMultiple?: boolean
  defaultOpen?: string[]
  className?: string
}

interface AccordionItemComponentProps {
  item: AccordionItem
  isOpen: boolean
  onToggle: () => void
}

function AccordionItemComponent({ item, isOpen, onToggle }: AccordionItemComponentProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <div className="bg-white border border-brand-border rounded-brand overflow-hidden">
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between px-5 py-4',
          'font-inter text-sm font-medium text-brand-title',
          'transition-all duration-150 hover:bg-brand-hover',
          isOpen && 'border-l-2 border-brand-gold'
        )}
      >
        <span className="flex items-center gap-3">
          {item.icon && (
            <span className="text-brand-gold flex-shrink-0">{item.icon}</span>
          )}
          {item.title}
        </span>
        <ChevronDown
          size={16} strokeWidth={1.5}
          className={cn(
            'text-brand-muted flex-shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <div
        style={{
          maxHeight: isOpen ? `${contentRef.current?.scrollHeight ?? 9999}px` : '0px',
          opacity: isOpen ? 1 : 0,
        }}
        className="overflow-hidden transition-all duration-300"
      >
        <div ref={contentRef} className="px-5 pb-5 pt-1">
          {item.children}
        </div>
      </div>
    </div>
  )
}

export default function Accordion({
  items,
  allowMultiple = false,
  defaultOpen = [],
  className,
}: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(defaultOpen))

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        if (!allowMultiple) next.clear()
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {items.map((item) => (
        <AccordionItemComponent
          key={item.id}
          item={item}
          isOpen={openIds.has(item.id)}
          onToggle={() => toggle(item.id)}
        />
      ))}
    </div>
  )
}
