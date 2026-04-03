'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { PlayCircle, FileText, Clock, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import VideoPlayer from '@/components/ui/VideoPlayer'
import type { Tutorial, TutorialType } from '@/lib/types'

const TYPE_LABELS: Record<TutorialType, string> = {
  youtube: 'YouTube',
  video: 'Vídeo',
  pdf: 'PDF',
  link: 'Link',
}

const TYPE_FILTER_OPTIONS: { value: TutorialType | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'video', label: 'Vídeo' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'pdf', label: 'PDF' },
  { value: 'link', label: 'Link' },
]

function ThumbnailPlaceholder({ type }: { type: TutorialType }) {
  return (
    <div className="w-full h-40 bg-brand-bg-secondary rounded-t-brand flex items-center justify-center">
      {type === 'pdf' ? (
        <FileText size={36} className="text-brand-muted" />
      ) : (
        <PlayCircle size={36} className="text-brand-muted" />
      )}
    </div>
  )
}

export default function GuidePage() {
  const params = useParams()
  const tripId = params.tripId as string

  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<TutorialType | 'all'>('all')
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null)

  const loadTutorials = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('tutorials')
      .select('*')
      .eq('trip_id', tripId)
      .order('order_index', { ascending: true })

    if (!error && data) setTutorials(data)
    setLoading(false)
  }, [tripId])

  useEffect(() => {
    loadTutorials()
  }, [loadTutorials])

  const filteredTutorials = tutorials.filter(
    (t) => activeFilter === 'all' || t.type === activeFilter
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
          <p className="font-inter text-sm text-brand-muted">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-cormorant text-3xl font-semibold text-brand-title">
          Guia Attica
        </h1>
        <p className="font-lora text-sm text-brand-muted mt-1">
          Tutoriais e vídeos para sua viagem
        </p>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {TYPE_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setActiveFilter(opt.value)}
            className={cn(
              'px-4 py-1.5 rounded-full font-inter text-sm transition-all',
              activeFilter === opt.value
                ? 'bg-brand-gold text-white shadow-gold'
                : 'border border-brand-border text-brand-text hover:bg-brand-hover'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filteredTutorials.length === 0 ? (
        <Card className="text-center py-16">
          <BookOpen size={40} className="text-brand-muted mx-auto mb-3" />
          <p className="font-cormorant text-xl text-brand-title mb-1">
            Nenhum tutorial disponível para esta viagem
          </p>
          <p className="font-lora text-sm text-brand-muted">
            Os tutoriais e guias serão adicionados pela equipe Attica.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutorials.map((tutorial) => (
            <Card key={tutorial.id} padding="none" className="flex flex-col overflow-hidden">
              {/* Thumbnail */}
              {tutorial.thumbnail_url ? (
                <img
                  src={tutorial.thumbnail_url}
                  alt={tutorial.title}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <ThumbnailPlaceholder type={tutorial.type} />
              )}

              {/* Body */}
              <div className="flex flex-col flex-1 p-4 space-y-2">
                <Badge variant="neutral" className="self-start">
                  {TYPE_LABELS[tutorial.type]}
                </Badge>

                <h2 className="font-cormorant text-lg font-semibold text-brand-title leading-snug">
                  {tutorial.title}
                </h2>

                {tutorial.description && (
                  <p className="font-lora text-sm text-brand-muted line-clamp-2">
                    {tutorial.description}
                  </p>
                )}

                {tutorial.duration_minutes && (
                  <div className="flex items-center gap-1 text-brand-muted">
                    <Clock size={13} />
                    <span className="font-inter text-xs">{tutorial.duration_minutes} min</span>
                  </div>
                )}

                <div className="pt-1 mt-auto">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => setSelectedTutorial(tutorial)}
                  >
                    {tutorial.type === 'pdf' ? 'Ver PDF' : tutorial.type === 'link' ? 'Abrir Link' : 'Assistir'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Video/Content Modal */}
      <Modal
        isOpen={!!selectedTutorial}
        onClose={() => setSelectedTutorial(null)}
        title={selectedTutorial?.title}
        size="xl"
      >
        {selectedTutorial && (
          <VideoPlayer
            url={selectedTutorial.url}
            type={selectedTutorial.type}
            title={selectedTutorial.title}
          />
        )}
      </Modal>
    </div>
  )
}
