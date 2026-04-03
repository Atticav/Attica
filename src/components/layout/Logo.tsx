import { cn } from '@/lib/utils'

type LogoSize = 'sm' | 'md' | 'lg'

interface LogoProps {
  size?: LogoSize
  className?: string
  showSubtitle?: boolean
}

const sizeConfig = {
  sm: { monogram: 28, title: 'text-sm', subtitle: 'text-[9px]', gap: 'gap-2' },
  md: { monogram: 36, title: 'text-base', subtitle: 'text-[10px]', gap: 'gap-2.5' },
  lg: { monogram: 48, title: 'text-xl', subtitle: 'text-xs', gap: 'gap-3' },
}

export default function Logo({
  size = 'md',
  className,
  showSubtitle = true,
}: LogoProps) {
  const config = sizeConfig[size]

  return (
    <div className={cn('flex items-center', config.gap, className)}>
      {/* Monograma SVG */}
      <svg
        width={config.monogram}
        height={config.monogram}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Círculo exterior */}
        <circle cx="24" cy="24" r="23" stroke="#C4A97D" strokeWidth="1" />
        {/* Monograma AC em Cormorant Garamond estilizado */}
        <text
          x="24"
          y="29"
          textAnchor="middle"
          fontFamily="Cormorant Garamond, serif"
          fontSize="20"
          fontWeight="600"
          fill="#C4A97D"
          letterSpacing="1"
        >
          AC
        </text>
      </svg>

      {/* Texto */}
      <div className="flex flex-col">
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
    </div>
  )
}
