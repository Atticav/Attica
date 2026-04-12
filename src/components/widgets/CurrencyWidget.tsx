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

/* SVG currency exchange icon – thin stroke, brand style */
function CurrencyIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={20}
      height={20}
    >
      <path d="M3 8h14l-4-4" />
      <path d="M21 16H7l4 4" />
      <circle cx="17" cy="8" r="0" />
      <circle cx="7" cy="16" r="0" />
    </svg>
  )
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
        const res = await fetch(`https://open.er-api.com/v6/latest/BRL`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Currency API error')
        const data = await res.json()
        const fetchedRate = data.rates?.[currencyCode]
        if (!fetchedRate) throw new Error('Currency not found')
        setRate(fetchedRate)
        // Use API's last update time if available, else current time
        const updateTime = data.time_last_update_utc
          ? new Date(data.time_last_update_utc).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
          : new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        setLastUpdate(updateTime)
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
  const inverseRate = rate ? (1 / rate) : null

  return (
    <Card padding="none" className="overflow-hidden border-brand-border">
      {/* Header */}
      <div className="px-5 py-4 bg-brand-bg border-b border-brand-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-gold/15 flex items-center justify-center flex-shrink-0">
            <CurrencyIcon className="text-brand-gold" />
          </div>
          <div>
            <h3 className="font-cormorant text-xl font-semibold text-brand-title">Câmbio</h3>
            <p className="font-inter text-xs text-brand-muted">Conversão em tempo real</p>
          </div>
        </div>
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
                aria-label="Inverter conversão"
              >
                <CurrencyIcon className="w-4 h-4" />
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

      {/* Footer – rates + last update */}
      {rate && (
        <div className="px-5 py-3 border-t border-brand-border bg-brand-bg space-y-0.5">
          <p className="font-inter text-xs text-brand-muted">
            1 BRL = {rate.toFixed(4)} {currencyCode}
          </p>
          {inverseRate && (
            <p className="font-inter text-xs text-brand-muted">
              1 {currencyCode} = {inverseRate.toFixed(4)} BRL
            </p>
          )}
          {lastUpdate && (
            <p className="font-inter text-[10px] text-brand-muted/70">
              Atualizado em {lastUpdate}
            </p>
          )}
        </div>
      )}
    </Card>
  )
}
