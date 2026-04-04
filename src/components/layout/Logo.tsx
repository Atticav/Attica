import { cn } from '@/lib/utils'

type LogoSize = 'sm' | 'md' | 'lg'

interface LogoProps {
  size?: LogoSize
  className?: string
  showSubtitle?: boolean
}

const sizeConfig = {
  sm: { title: 'text-sm', subtitle: 'text-[9px]' },
  md: { title: 'text-base', subtitle: 'text-[10px]' },
  lg: { title: 'text-xl', subtitle: 'text-xs' },
}

export default function Logo({
  size = 'md',
  className,
  showSubtitle = true,
}: LogoProps) {
  const config = sizeConfig[size]

  return (
    <div className={cn('flex flex-col', className)}>
      <span
        className={cn(
          'font-cinzel font-semibold text-brand-title tracking-[0.2em] leading-none',
          config.title
        )}
      >
        ATTICA
      </span>
      {showSubtitle && (
        <span
          className={cn(
            'font-cormorant italic text-brand-muted tracking-wider leading-tight mt-0.5',
            config.subtitle
          )}
        >
          Studio de Viagens
        </span>
      )}
    </div>
  )
}
