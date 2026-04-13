'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Landmark, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import Card from '@/components/ui/Card'
import Accordion from '@/components/ui/Accordion'
import Badge from '@/components/ui/Badge'
import type { CulturalInfo } from '@/lib/types'

export default function CulturePage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { t } = useLanguage()
  const [items, setItems] = useState<CulturalInfo[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('cultural_info')
      .select('*')
      .eq('trip_id', tripId)
      .order('order_index', { ascending: true })

    if (!error && data) setItems(data)
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

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="font-cormorant text-3xl font-semibold text-brand-title">Cultura</h1>
          <p className="font-outfit text-sm text-brand-muted">Informações culturais do destino</p>
        </div>
        <Card className="text-center py-16">
          <Landmark size={40} strokeWidth={1.5} className="text-brand-muted mx-auto mb-3" />
          <p className="font-cormorant text-xl text-brand-title mb-1">Nenhuma informação cultural</p>
          <p className="font-outfit text-sm text-brand-muted">
            As informações culturais do destino aparecerão aqui.
          </p>
        </Card>
      </div>
    )
  }

  const grouped = items.reduce<Record<string, CulturalInfo[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  const categories = Object.keys(grouped)

  const accordionItems = categories.map((category) => ({
    id: category,
    title: category,
    icon: <Landmark size={18} strokeWidth={1.5} />,
    children: (
      <div className="space-y-4">
        {grouped[category].map((item) => (
          <div
            key={item.id}
            className={
              item.is_important
                ? 'rounded-lg border-l-4 border-brand-gold bg-brand-gold/5 px-4 py-3'
                : 'px-1 py-1'
            }
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-inter text-sm font-medium text-brand-title">
                    {item.title}
                  </h4>
                  {item.is_important && (
                    <Badge variant="warning">
                      <Star size={11} strokeWidth={1.5} className="mr-0.5 fill-current" />
                      Importante
                    </Badge>
                  )}
                </div>
                <p className="font-outfit text-sm text-brand-text leading-relaxed whitespace-pre-line">
                  {item.content}
                </p>
                {item.image_url && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-auto rounded-lg border border-brand-border mt-3"
                    loading="lazy"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
  }))

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-cormorant text-3xl font-semibold text-brand-title">Cultura</h1>
        <p className="font-outfit text-sm text-brand-muted">
          {items.length} {items.length === 1 ? 'informação' : 'informações'} em{' '}
          {categories.length} {categories.length === 1 ? 'categoria' : 'categorias'}
        </p>
      </div>

      <Accordion items={accordionItems} allowMultiple defaultOpen={[categories[0]]} />
    </div>
  )
}
