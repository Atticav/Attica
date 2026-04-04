import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  count?: number
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (id: string) => void
  className?: string
}

export default function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        'flex border-b border-brand-border overflow-x-auto scrollbar-none',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 font-inter text-sm whitespace-nowrap',
              'border-b-2 -mb-px transition-all duration-150',
              isActive
                ? 'border-brand-gold text-brand-gold font-medium'
                : 'border-transparent text-brand-text hover:text-brand-title hover:border-brand-border'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1',
                  'font-inter text-xs rounded-full',
                  isActive
                    ? 'bg-brand-gold/20 text-brand-gold'
                    : 'bg-brand-hover text-brand-muted'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
