import React from 'react';

interface AtticaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
  className?: string;
}

export function AtticaLogo({ size = 'md', variant = 'full', className = '' }: AtticaLogoProps) {
  const sizes = {
    sm: { circle: 32, text: 'text-xs', initials: 'text-sm', title: 'text-base', subtitle: 'text-[10px]' },
    md: { circle: 40, text: 'text-sm', initials: 'text-base', title: 'text-xl', subtitle: 'text-xs' },
    lg: { circle: 56, text: 'text-base', initials: 'text-xl', title: 'text-3xl', subtitle: 'text-sm' },
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Monogram circle */}
      <div
        style={{ width: s.circle, height: s.circle }}
        className="flex-shrink-0 rounded-full bg-[#C4A97D] flex items-center justify-center shadow-sm"
      >
        <span className={`font-cinzel font-bold text-white ${s.initials} leading-none`}>
          AC
        </span>
      </div>

      {variant === 'full' && (
        <div className="flex flex-col leading-tight">
          <span className={`font-cinzel font-bold text-[#2D2D2D] tracking-widest uppercase ${s.title}`}>
            ATTICA
          </span>
          <span className={`font-lora text-[#8B7355] tracking-wider italic ${s.subtitle}`}>
            Studio de Viagens
          </span>
        </div>
      )}
    </div>
  );
}
