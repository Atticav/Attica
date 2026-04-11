'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'

interface CurrencyWidgetProps {
  currencyCode: string
  currencyName: string
}

function extractCurrencyCode(currency: string): string {
  const match = currency.match(/^([A-Z]{3})/)
  return match ? match[1] : 'USD'
}

export default function CurrencyWidget({ currencyCode: rawCurrency, currencyName }: CurrencyWidgetProps) {
  const currencyCode = extractCurrencyCode(rawCurrency)
  const [rate, setRate] = useState<number | null>(null)
  const [brlValue, setBrlValue] = useState('100')
  const [reversed, setReversed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [lastUpdate, setLastUpdate] = useState('')

  useEffect(() => {
    async function fetchRate() {
      if (currencyCode === 'BRL') {
        setRate(1)
        setLoading(false)
        return
      }
      try {
        const res = await fetch(`https://api.frankfurter.app/latest?from=BRL&to=${currencyCode}`)
        if (!res.ok) throw new Error('Currency API error')
        const data = await res.json()
        const fetchedRate = data.rates[currencyCode]
        if (!fetchedRate) throw new Error('Currency not found')
        setRate(fetchedRate)
        setLastUpdate(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchRate()
  }, [currencyCode])

  if (error || currencyCode === 'BRL') return null

  const numericValue = parseFloat(brlValue) || 0
  const convertedValue = rate ? (reversed ? numericValue / rate : numericValue * rate) : 0

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-4 text-white">
        <p className="font-inter text-xs uppercase tracking-wider opacity-80">Câmbio</p>
        <h3 className="font-cormorant text-xl font-semibold">Conversor de Moeda</h3>
      </div>

      {/* Converter */}
      <div className="px-5 py-5">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="w-5 h-5 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* From */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-brand-bg-secondary flex items-center justify-center">
                <span className="font-inter text-sm font-bold text-brand-gold">
                  {reversed ? currencyCode : 'BRL'}
                </span>
              </div>
              <div className="flex-1">
                <label className="font-inter text-xs text-brand-muted block mb-1">
                  {reversed ? currencyName : 'Real Brasileiro'}
                </label>
                <input
                  type="number"
                  value={brlValue}
                  onChange={(e) => setBrlValue(e.target.value)}
                  className="w-full font-inter text-lg font-semibold text-brand-title bg-transparent border-b border-brand-border focus:border-brand-gold focus:outline-none pb-1 transition-colors"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Swap button */}
            <div className="flex justify-center">
              <button
                onClick={() => setReversed(!reversed)}
                className="w-8 h-8 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center hover:bg-brand-hover transition-colors text-brand-muted hover:text-brand-gold"
              >
                ↕
              </button>
            </div>

            {/* To */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-brand-bg-secondary flex items-center justify-center">
                <span className="font-inter text-sm font-bold text-brand-gold">
                  {reversed ? 'BRL' : currencyCode}
                </span>
              </div>
              <div className="flex-1">
                <label className="font-inter text-xs text-brand-muted block mb-1">
                  {reversed ? 'Real Brasileiro' : currencyName}
                </label>
                <p className="font-inter text-lg font-semibold text-brand-title border-b border-brand-border pb-1">
                  {convertedValue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {rate && (
        <div className="px-5 py-3 border-t border-brand-border bg-brand-bg">
          <p className="font-inter text-xs text-brand-muted">
            1 BRL = {rate.toFixed(4)} {currencyCode}
            {lastUpdate && ` · Câmbio comercial às ${lastUpdate}`}
          </p>
        </div>
      )}
    </Card>
  )
}
