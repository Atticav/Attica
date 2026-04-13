'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import {
  Smartphone, Landmark, Shield, Car, ShoppingBag, Package, Info, ExternalLink, Compass,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Accordion from '@/components/ui/Accordion'
import type { StrategicSection, StrategicLink } from '@/lib/types'
import type { ReactNode } from 'react'

function getSectionIcon(title: string): ReactNode {
  const lower = title.toLowerCase()
  if (lower.includes('chip') || lower.includes('sim') || lower.includes('celular')) return <Smartphone size={18} strokeWidth={1.5} />
  if (lower.includes('banco') || lower.includes('bank') || lower.includes('atm') || lower.includes('caixa')) return <Landmark size={18} strokeWidth={1.5} />
  if (lower.includes('seguro') || lower.includes('insurance')) return <Shield size={18} strokeWidth={1.5} />
  if (lower.includes('carro') || lower.includes('car') || lower.includes('aluguel')) return <Car size={18} strokeWidth={1.5} />
  if (lower.includes('bolsa') || lower.includes('mochila') || lower.includes('bag')) return <ShoppingBag size={18} strokeWidth={1.5} />
  if (lower.includes('essencial') || lower.includes('essential')) return <Package size={18} strokeWidth={1.5} />
  return <Info size={18} strokeWidth={1.5} />
}

export default function StrategicPage() {
  const params = useParams()
  const tripId = params.tripId as string

  const [sections, setSections] = useState<StrategicSection[]>([])
  const [links, setLinks] = useState<StrategicLink[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    const [sectionsResult, linksResult] = await Promise.all([
      supabase
        .from('strategic_sections')
        .select('*')
        .eq('trip_id', tripId)
        .order('order_index', { ascending: true }),
      supabase
        .from('strategic_links')
        .select('*')
        .eq('trip_id', tripId)
        .order('order_index', { ascending: true }),
    ])

    if (!sectionsResult.error && sectionsResult.data) setSections(sectionsResult.data)
    if (!linksResult.error && linksResult.data) setLinks(linksResult.data)
    setLoading(false)
  }, [tripId])

  useEffect(() => {
    loadData()
  }, [loadData])

  function getLinksForSection(sectionTitle: string): StrategicLink[] {
    return links.filter(
      (l) => l.category && l.category.toLowerCase() === sectionTitle.toLowerCase()
    )
  }

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

  const accordionItems = sections.map((section) => {
    const sectionLinks = getLinksForSection(section.title)
    return {
      id: section.id,
      title: section.title,
      icon: getSectionIcon(section.title),
      children: (
        <div className="space-y-4">
          {section.content && (
            <div className="bg-brand-bg-secondary border-l-4 border-brand-gold rounded p-4">
              <p className="font-outfit text-sm text-brand-text whitespace-pre-wrap leading-relaxed">
                {section.content}
              </p>
            </div>
          )}

          {section.image_url && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={section.image_url}
              alt={section.title}
              className="w-full h-auto rounded-lg border border-brand-border"
              loading="lazy"
            />
          )}

          {sectionLinks.length > 0 && (
            <div className="space-y-2">
              <p className="font-inter text-xs font-medium text-brand-muted uppercase tracking-wider">
                Links úteis
              </p>
              {sectionLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 bg-white border border-brand-border rounded-lg px-4 py-3 hover:border-brand-gold hover:shadow-soft transition-all cursor-pointer group"
                >
                  <ExternalLink
                    size={16} strokeWidth={1.5}
                    className="text-brand-muted group-hover:text-brand-gold flex-shrink-0 mt-0.5 transition-colors"
                  />
                  <div className="min-w-0">
                    <p className="font-inter text-sm font-medium text-brand-title group-hover:text-brand-gold transition-colors truncate">
                      {link.title}
                    </p>
                    {link.description && (
                      <p className="font-outfit text-xs text-brand-muted mt-0.5 line-clamp-2">
                        {link.description}
                      </p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      ),
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-cormorant text-3xl font-semibold text-brand-title">
          Central Estratégica
        </h1>
        <p className="font-outfit text-sm text-brand-muted mt-1">
          Dicas e informações essenciais para sua viagem
        </p>
      </div>

      {/* Empty state */}
      {sections.length === 0 ? (
        <Card className="text-center py-16">
          <Compass size={40} strokeWidth={1.5} className="text-brand-muted mx-auto mb-3" />
          <p className="font-cormorant text-xl text-brand-title mb-1">
            Nenhuma informação estratégica cadastrada
          </p>
          <p className="font-outfit text-sm text-brand-muted">
            As dicas estratégicas para sua viagem aparecerão aqui.
          </p>
        </Card>
      ) : (
        <Accordion items={accordionItems} allowMultiple defaultOpen={[sections[0].id]} />
      )}
    </div>
  )
}
