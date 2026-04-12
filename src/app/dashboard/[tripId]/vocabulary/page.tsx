'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { BookOpen, Volume2, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import type { Vocabulary, Trip } from '@/lib/types'

// ─── Language detection ──────────────────────────────────────────────

function getLanguageCode(destination: string, country: string): string {
  const lower = (destination + ' ' + country).toLowerCase()
  if (/peru|argentina|espanha|chile|colombia|mexico|uruguai/.test(lower)) return 'es'
  if (/fran[cç]a|paris/.test(lower)) return 'fr'
  if (/it[aá]lia|roma|mil[aã]o|veneza/.test(lower)) return 'it'
  if (/alemanha|berlin|munique/.test(lower)) return 'de'
  if (/jap[aã]o|tokyo|kyoto/.test(lower)) return 'ja'
  if (/estados unidos|eua|usa|nova york|miami|londres|inglaterra/.test(lower)) return 'en'
  if (/portugal|lisboa|porto/.test(lower)) return 'pt'
  return 'en'
}

function speak(text: string, langCode: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const langMap: Record<string, string> = {
    es: 'es-ES', fr: 'fr-FR', it: 'it-IT', de: 'de-DE', ja: 'ja-JP', pt: 'pt-BR', en: 'en-US',
  }
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = langMap[langCode] || 'en-US'
  utterance.rate = 0.8
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}

// ─── Default vocabulary ──────────────────────────────────────────────

const DEFAULT_VOCABULARY: Record<string, { pt: string; translations: Record<string, string> }[]> = {
  'Cumprimentos': [
    { pt: 'Olá', translations: { es: 'Hola', en: 'Hello', fr: 'Bonjour', it: 'Ciao', de: 'Hallo', ja: 'こんにちは' } },
    { pt: 'Obrigado(a)', translations: { es: 'Gracias', en: 'Thank you', fr: 'Merci', it: 'Grazie', de: 'Danke', ja: 'ありがとう' } },
    { pt: 'Por favor', translations: { es: 'Por favor', en: 'Please', fr: "S'il vous plaît", it: 'Per favore', de: 'Bitte', ja: 'お願いします' } },
    { pt: 'Bom dia', translations: { es: 'Buenos días', en: 'Good morning', fr: 'Bonjour', it: 'Buongiorno', de: 'Guten Morgen', ja: 'おはようございます' } },
    { pt: 'Boa noite', translations: { es: 'Buenas noches', en: 'Good evening', fr: 'Bonsoir', it: 'Buonasera', de: 'Guten Abend', ja: 'こんばんは' } },
    { pt: 'Tchau', translations: { es: 'Adiós', en: 'Goodbye', fr: 'Au revoir', it: 'Arrivederci', de: 'Tschüss', ja: 'さようなら' } },
    { pt: 'Com licença', translations: { es: 'Con permiso', en: 'Excuse me', fr: 'Excusez-moi', it: 'Mi scusi', de: 'Entschuldigung', ja: 'すみません' } },
  ],
  'Emergências': [
    { pt: 'Socorro!', translations: { es: '¡Socorro!', en: 'Help!', fr: 'Au secours !', it: 'Aiuto!', de: 'Hilfe!', ja: '助けて！' } },
    { pt: 'Polícia', translations: { es: 'Policía', en: 'Police', fr: 'Police', it: 'Polizia', de: 'Polizei', ja: '警察' } },
    { pt: 'Hospital', translations: { es: 'Hospital', en: 'Hospital', fr: 'Hôpital', it: 'Ospedale', de: 'Krankenhaus', ja: '病院' } },
    { pt: 'Farmácia', translations: { es: 'Farmacia', en: 'Pharmacy', fr: 'Pharmacie', it: 'Farmacia', de: 'Apotheke', ja: '薬局' } },
    { pt: 'Estou perdido(a)', translations: { es: 'Estoy perdido(a)', en: "I'm lost", fr: 'Je suis perdu(e)', it: 'Mi sono perso(a)', de: 'Ich bin verloren', ja: '道に迷いました' } },
    { pt: 'Preciso de ajuda', translations: { es: 'Necesito ayuda', en: 'I need help', fr: "J'ai besoin d'aide", it: 'Ho bisogno di aiuto', de: 'Ich brauche Hilfe', ja: '助けが必要です' } },
    { pt: 'Embaixada', translations: { es: 'Embajada', en: 'Embassy', fr: 'Ambassade', it: 'Ambasciata', de: 'Botschaft', ja: '大使館' } },
  ],
  'Restaurante': [
    { pt: 'Cardápio', translations: { es: 'Menú', en: 'Menu', fr: 'Menu', it: 'Menu', de: 'Speisekarte', ja: 'メニュー' } },
    { pt: 'A conta, por favor', translations: { es: 'La cuenta, por favor', en: 'The bill, please', fr: "L'addition, s'il vous plaît", it: 'Il conto, per favore', de: 'Die Rechnung, bitte', ja: 'お会計をお願いします' } },
    { pt: 'Água', translations: { es: 'Agua', en: 'Water', fr: 'Eau', it: 'Acqua', de: 'Wasser', ja: '水' } },
    { pt: 'Vinho', translations: { es: 'Vino', en: 'Wine', fr: 'Vin', it: 'Vino', de: 'Wein', ja: 'ワイン' } },
    { pt: 'Delicioso', translations: { es: 'Delicioso', en: 'Delicious', fr: 'Délicieux', it: 'Delizioso', de: 'Köstlich', ja: 'おいしい' } },
    { pt: 'Vegetariano', translations: { es: 'Vegetariano', en: 'Vegetarian', fr: 'Végétarien', it: 'Vegetariano', de: 'Vegetarisch', ja: 'ベジタリアン' } },
    { pt: 'Mesa para dois', translations: { es: 'Mesa para dos', en: 'Table for two', fr: 'Table pour deux', it: 'Tavolo per due', de: 'Tisch für zwei', ja: '二人用のテーブル' } },
  ],
  'Transporte': [
    { pt: 'Aeroporto', translations: { es: 'Aeropuerto', en: 'Airport', fr: 'Aéroport', it: 'Aeroporto', de: 'Flughafen', ja: '空港' } },
    { pt: 'Táxi', translations: { es: 'Taxi', en: 'Taxi', fr: 'Taxi', it: 'Taxi', de: 'Taxi', ja: 'タクシー' } },
    { pt: 'Ônibus', translations: { es: 'Autobús', en: 'Bus', fr: 'Bus', it: 'Autobus', de: 'Bus', ja: 'バス' } },
    { pt: 'Trem', translations: { es: 'Tren', en: 'Train', fr: 'Train', it: 'Treno', de: 'Zug', ja: '電車' } },
    { pt: 'Quanto custa?', translations: { es: '¿Cuánto cuesta?', en: 'How much?', fr: 'Combien ?', it: 'Quanto costa?', de: 'Wie viel kostet?', ja: 'いくらですか？' } },
    { pt: 'Onde fica...?', translations: { es: '¿Dónde está...?', en: 'Where is...?', fr: 'Où est... ?', it: 'Dove si trova...?', de: 'Wo ist...?', ja: '...はどこですか？' } },
    { pt: 'Metrô', translations: { es: 'Metro', en: 'Subway', fr: 'Métro', it: 'Metropolitana', de: 'U-Bahn', ja: '地下鉄' } },
  ],
  'Números': [
    { pt: 'Um (1)', translations: { es: 'Uno', en: 'One', fr: 'Un', it: 'Uno', de: 'Eins', ja: '一 (いち)' } },
    { pt: 'Dois (2)', translations: { es: 'Dos', en: 'Two', fr: 'Deux', it: 'Due', de: 'Zwei', ja: '二 (に)' } },
    { pt: 'Três (3)', translations: { es: 'Tres', en: 'Three', fr: 'Trois', it: 'Tre', de: 'Drei', ja: '三 (さん)' } },
    { pt: 'Quatro (4)', translations: { es: 'Cuatro', en: 'Four', fr: 'Quatre', it: 'Quattro', de: 'Vier', ja: '四 (し)' } },
    { pt: 'Cinco (5)', translations: { es: 'Cinco', en: 'Five', fr: 'Cinq', it: 'Cinque', de: 'Fünf', ja: '五 (ご)' } },
    { pt: 'Seis (6)', translations: { es: 'Seis', en: 'Six', fr: 'Six', it: 'Sei', de: 'Sechs', ja: '六 (ろく)' } },
    { pt: 'Sete (7)', translations: { es: 'Siete', en: 'Seven', fr: 'Sept', it: 'Sette', de: 'Sieben', ja: '七 (なな)' } },
    { pt: 'Oito (8)', translations: { es: 'Ocho', en: 'Eight', fr: 'Huit', it: 'Otto', de: 'Acht', ja: '八 (はち)' } },
    { pt: 'Nove (9)', translations: { es: 'Nueve', en: 'Nine', fr: 'Neuf', it: 'Nove', de: 'Neun', ja: '九 (きゅう)' } },
    { pt: 'Dez (10)', translations: { es: 'Diez', en: 'Ten', fr: 'Dix', it: 'Dieci', de: 'Zehn', ja: '十 (じゅう)' } },
  ],
  'Compras': [
    { pt: 'Quanto custa?', translations: { es: '¿Cuánto cuesta?', en: 'How much is it?', fr: 'Combien ça coûte ?', it: 'Quanto costa?', de: 'Wie viel kostet das?', ja: 'いくらですか？' } },
    { pt: 'Caro', translations: { es: 'Caro', en: 'Expensive', fr: 'Cher', it: 'Caro', de: 'Teuer', ja: '高い' } },
    { pt: 'Barato', translations: { es: 'Barato', en: 'Cheap', fr: 'Bon marché', it: 'Economico', de: 'Günstig', ja: '安い' } },
    { pt: 'Desconto', translations: { es: 'Descuento', en: 'Discount', fr: 'Réduction', it: 'Sconto', de: 'Rabatt', ja: '割引' } },
    { pt: 'Tamanho', translations: { es: 'Talla', en: 'Size', fr: 'Taille', it: 'Taglia', de: 'Größe', ja: 'サイズ' } },
    { pt: 'Posso experimentar?', translations: { es: '¿Puedo probármelo?', en: 'Can I try it on?', fr: 'Puis-je essayer ?', it: 'Posso provare?', de: 'Kann ich anprobieren?', ja: '試着できますか？' } },
    { pt: 'Cartão de crédito', translations: { es: 'Tarjeta de crédito', en: 'Credit card', fr: 'Carte de crédit', it: 'Carta di credito', de: 'Kreditkarte', ja: 'クレジットカード' } },
  ],
  'Hotéis': [
    { pt: 'Reserva', translations: { es: 'Reserva', en: 'Reservation', fr: 'Réservation', it: 'Prenotazione', de: 'Reservierung', ja: '予約' } },
    { pt: 'Quarto', translations: { es: 'Habitación', en: 'Room', fr: 'Chambre', it: 'Camera', de: 'Zimmer', ja: '部屋' } },
    { pt: 'Check-in', translations: { es: 'Check-in', en: 'Check-in', fr: 'Enregistrement', it: 'Check-in', de: 'Check-in', ja: 'チェックイン' } },
    { pt: 'Check-out', translations: { es: 'Check-out', en: 'Check-out', fr: 'Départ', it: 'Check-out', de: 'Check-out', ja: 'チェックアウト' } },
    { pt: 'Chave', translations: { es: 'Llave', en: 'Key', fr: 'Clé', it: 'Chiave', de: 'Schlüssel', ja: '鍵' } },
    { pt: 'Wi-Fi', translations: { es: 'Wi-Fi', en: 'Wi-Fi', fr: 'Wi-Fi', it: 'Wi-Fi', de: 'WLAN', ja: 'Wi-Fi' } },
    { pt: 'Café da manhã', translations: { es: 'Desayuno', en: 'Breakfast', fr: 'Petit-déjeuner', it: 'Colazione', de: 'Frühstück', ja: '朝食' } },
  ],
}

const LANG_LABELS: Record<string, string> = {
  es: 'Espanhol', en: 'Inglês', fr: 'Francês', it: 'Italiano', de: 'Alemão', ja: 'Japonês', pt: 'Português',
}

// ─── Component ───────────────────────────────────────────────────────

function SpeakButton({ text, langCode }: { text: string; langCode: string }) {
  return (
    <button
      onClick={() => speak(text, langCode)}
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
  const [extraWords, setExtraWords] = useState<Vocabulary[]>([])
  const [langCode, setLangCode] = useState<string>('en')
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    const [tripResult, vocabResult] = await Promise.all([
      supabase.from('trips').select('destination, country').eq('id', tripId).single(),
      supabase.from('vocabulary').select('*').eq('trip_id', tripId).order('order_index', { ascending: true }),
    ])

    if (tripResult.data) {
      setLangCode(getLanguageCode(tripResult.data.destination, tripResult.data.country))
    }
    if (!vocabResult.error && vocabResult.data) {
      setExtraWords(vocabResult.data)
    }
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

  const defaultCategories = Object.keys(DEFAULT_VOCABULARY)

  const extraGrouped = extraWords.reduce<Record<string, Vocabulary[]>>((acc, word) => {
    const cat = word.category || 'Geral'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(word)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-cormorant text-3xl font-semibold text-brand-title">Vocabulário</h1>
        <p className="font-outfit text-sm text-brand-muted">
          Palavras úteis em {LANG_LABELS[langCode] || 'Inglês'} para sua viagem
        </p>
      </div>

      {defaultCategories.map((category) => (
        <div key={category} className="space-y-3">
          <h2 className="font-cormorant text-xl font-semibold text-brand-title">{category}</h2>
          <Card padding="none">
            <div className="divide-y divide-brand-border">
              {DEFAULT_VOCABULARY[category].map((word, idx) => {
                const translation = word.translations[langCode] || word.translations['en'] || ''
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-brand-hover/50 transition-colors"
                  >
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-4">
                      <div>
                        <span className="font-inter text-sm font-medium text-brand-title">
                          {word.pt}
                        </span>
                      </div>
                      <div>
                        <span className="font-inter text-sm text-brand-text">
                          {translation}
                        </span>
                      </div>
                    </div>
                    <SpeakButton text={translation} langCode={langCode} />
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      ))}

      {extraWords.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} strokeWidth={1.5} className="text-brand-gold" />
            <h2 className="font-cormorant text-xl font-semibold text-brand-title">
              Palavras Adicionais da Attica
            </h2>
            <Badge variant="gold">{extraWords.length}</Badge>
          </div>

          {Object.keys(extraGrouped).map((category) => (
            <div key={category} className="space-y-3">
              <h3 className="font-inter text-sm font-medium text-brand-muted">{category}</h3>
              <Card padding="none" className="border-brand-gold/30 bg-brand-gold/5">
                <div className="divide-y divide-brand-border">
                  {extraGrouped[category].map((word) => (
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
                      <SpeakButton text={word.local_language} langCode={langCode} />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
