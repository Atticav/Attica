'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { BookOpen, Volume2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import Card from '@/components/ui/Card'
import type { Vocabulary } from '@/lib/types'

function SpeakButton({ text, lang }: { text: string; lang?: string }) {
  const handleSpeak = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    if (lang) utterance.lang = lang
    utterance.rate = 0.8
    window.speechSynthesis.speak(utterance)
  }

  return (
    <button
      onClick={handleSpeak}
      className="p-1.5 rounded-lg text-brand-muted hover:text-brand-gold hover:bg-brand-hover transition-all"
      title="Ouvir pronúncia"
      type="button"
    >
      <Volume2 size={16} strokeWidth={1.5} />
    </button>
  )
}

export default function VocabularyPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { t } = useLanguage()
  const [words, setWords] = useState<Vocabulary[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('vocabulary')
      .select('*')
      .eq('trip_id', tripId)
      .order('order_index', { ascending: true })

    if (!error && data) setWords(data)
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

  if (words.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="font-cormorant text-3xl font-semibold text-brand-title">Vocabulário</h1>
          <p className="font-outfit text-sm text-brand-muted">Palavras úteis para sua viagem</p>
        </div>
        <Card className="text-center py-16">
          <BookOpen size={40} strokeWidth={1.5} className="text-brand-muted mx-auto mb-3" />
          <p className="font-cormorant text-xl text-brand-title mb-1">Nenhuma palavra</p>
          <p className="font-outfit text-sm text-brand-muted">
            O vocabulário útil para sua viagem aparecerá aqui.
          </p>
        </Card>
      </div>
    )
  }

  const grouped = words.reduce<Record<string, Vocabulary[]>>((acc, word) => {
    const cat = word.category || 'Geral'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(word)
    return acc
  }, {})

  const categories = Object.keys(grouped)

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-cormorant text-3xl font-semibold text-brand-title">Vocabulário</h1>
        <p className="font-outfit text-sm text-brand-muted">
          {words.length} {words.length === 1 ? 'palavra' : 'palavras'} em{' '}
          {categories.length} {categories.length === 1 ? 'categoria' : 'categorias'}
        </p>
      </div>

      {categories.map((category) => (
        <div key={category} className="space-y-3">
          <h2 className="font-cormorant text-xl font-semibold text-brand-title">{category}</h2>
          <Card padding="none">
            <div className="divide-y divide-brand-border">
              {grouped[category].map((word) => (
                <div
                  key={word.id}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-brand-hover/50 transition-colors"
                >
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                    <div>
                      <span className="font-inter text-sm font-medium text-brand-title">
                        {word.portuguese}
                      </span>
                    </div>
                    <div>
                      <span className="font-inter text-sm text-brand-text">
                        {word.local_language}
                      </span>
                    </div>
                    <div>
                      {word.pronunciation && (
                        <span className="font-outfit text-sm text-brand-muted italic">
                          {word.pronunciation}
                        </span>
                      )}
                    </div>
                  </div>
                  <SpeakButton text={word.local_language} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      ))}
    </div>
  )
}
