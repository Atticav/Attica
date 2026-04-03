import { ExternalLink, PlayCircle, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TutorialType } from '@/lib/types'

interface VideoPlayerProps {
  url: string
  type: TutorialType
  title?: string
  className?: string
}

function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.slice(1).split('?')[0]
    }
    if (parsed.hostname.includes('youtube.com')) {
      return parsed.searchParams.get('v')
    }
  } catch {
    // fallback regex for malformed URLs
    const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)
    return match ? match[1] : null
  }
  return null
}

export default function VideoPlayer({ url, type, title, className }: VideoPlayerProps) {
  if (type === 'youtube') {
    const videoId = extractYouTubeId(url)
    if (!videoId) {
      return (
        <div className={cn('aspect-video bg-brand-bg-secondary rounded-brand flex items-center justify-center', className)}>
          <p className="font-inter text-sm text-brand-muted">URL do YouTube inválida</p>
        </div>
      )
    }
    return (
      <div className={cn('aspect-video w-full rounded-brand overflow-hidden', className)}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title ?? 'YouTube video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    )
  }

  if (type === 'video') {
    return (
      <div className={cn('aspect-video w-full rounded-brand overflow-hidden bg-black', className)}>
        <video
          src={url}
          controls
          className="w-full h-full object-contain"
          title={title}
        />
      </div>
    )
  }

  if (type === 'pdf') {
    return (
      <div className={cn('aspect-video w-full rounded-brand overflow-hidden', className)}>
        <iframe
          src={url}
          title={title ?? 'PDF'}
          className="w-full h-full border-0"
        />
      </div>
    )
  }

  // type === 'link'
  return (
    <div
      className={cn(
        'aspect-video w-full rounded-brand bg-brand-bg-secondary',
        'flex flex-col items-center justify-center gap-4 p-8',
        className
      )}
    >
      <div className="p-4 bg-white rounded-full shadow-soft">
        <ExternalLink size={32} className="text-brand-gold" />
      </div>
      {title && (
        <p className="font-cormorant text-xl text-brand-title text-center">{title}</p>
      )}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-gold text-white font-inter text-sm font-medium rounded-lg hover:bg-brand-gold-dark transition-colors shadow-gold"
      >
        <ExternalLink size={14} />
        Abrir Link
      </a>
      <p className="font-inter text-xs text-brand-muted break-all text-center max-w-xs">{url}</p>
    </div>
  )
}
