'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Camera, MapPin, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import Card from '@/components/ui/Card'
import Accordion from '@/components/ui/Accordion'
import type { PhotographyTip } from '@/lib/types'

export default function PhotographyPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { t } = useLanguage()
  const [tips, setTips] = useState<PhotographyTip[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('photography_tips')
      .select('*')
      .eq('trip_id', tripId)
      .order('order_index', { ascending: true })

    if (!error && data) setTips(data)
    setLoading(false)
  }, [tripId])

  useEffect(() => {
    loadData()
  }, [loadData])

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

  if (tips.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="font-cormorant text-3xl font-semibold text-brand-title">Fotografia</h1>
          <p className="font-outfit text-sm text-brand-muted">Dicas de fotografia para sua viagem</p>
        </div>
        <Card className="text-center py-16">
          <Camera size={40} strokeWidth={1.5} className="text-brand-muted mx-auto mb-3" />
          <p className="font-cormorant text-xl text-brand-title mb-1">Nenhuma dica de fotografia</p>
          <p className="font-outfit text-sm text-brand-muted">
            As dicas de fotografia aparecerão aqui.
          </p>
        </Card>
      </div>
    )
  }

  const accordionItems = tips.map((tip) => ({
    id: tip.id,
    title: tip.title,
    icon: <Camera size={18} strokeWidth={1.5} />,
    children: (
      <div className="space-y-4">
        <p className="font-outfit text-sm text-brand-text leading-relaxed">{tip.tip_text}</p>

        {tip.description && (
          <p className="font-outfit text-sm text-brand-muted">{tip.description}</p>
        )}

        <div className="flex flex-wrap gap-4">
          {tip.location && (
            <div className="flex items-center gap-1.5 text-brand-muted">
              <MapPin size={14} strokeWidth={1.5} />
              <span className="font-inter text-xs">{tip.location}</span>
            </div>
          )}
          {tip.best_time && (
            <div className="flex items-center gap-1.5 text-brand-muted">
              <Clock size={14} strokeWidth={1.5} />
              <span className="font-inter text-xs">{tip.best_time}</span>
            </div>
          )}
        </div>

        {tip.image_url && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={tip.image_url}
            alt={tip.title}
            className="w-full h-auto rounded-brand border border-brand-border mt-2"
            loading="lazy"
          />
        )}

        {tip.video_url && (
          <div className="mt-2">
            {tip.video_url.includes('youtube.com') || tip.video_url.includes('youtu.be') ? (
              <a
                href={tip.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-inter text-xs font-medium text-brand-gold hover:text-brand-gold-dark transition-colors"
              >
                <Camera size={13} strokeWidth={1.5} />
                Ver vídeo
              </a>
            ) : (
              <video
                src={tip.video_url}
                controls
                className="w-full h-auto rounded-brand border border-brand-border"
              />
            )}
          </div>
        )}
      </div>
    ),
  }))

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-cormorant text-3xl font-semibold text-brand-title">Fotografia</h1>
        <p className="font-outfit text-sm text-brand-muted">
          {tips.length} {tips.length === 1 ? 'dica' : 'dicas'} de fotografia
        </p>
      </div>

      <Accordion items={accordionItems} allowMultiple />
    </div>
  )
}
