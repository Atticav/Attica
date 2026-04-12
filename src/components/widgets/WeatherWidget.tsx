'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'

interface WeatherDay {
  date: string
  dayName: string
  maxTemp: number
  minTemp: number
  weatherCode: number
}

interface WeatherWidgetProps {
  latitude: number
  longitude: number
  destinationName: string
}

/* ---------- SVG weather icons (inline, stroke, no fill) ---------- */

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="6.76" y2="6.76" />
      <line x1="17.24" y1="17.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="6.76" y2="17.24" />
      <line x1="17.24" y1="6.76" x2="19.07" y2="4.93" />
    </svg>
  )
}

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
  )
}

function PartlyCloudyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="8" cy="8" r="3" />
      <line x1="8" y1="1" x2="8" y2="3" />
      <line x1="3.05" y1="3.05" x2="4.46" y2="4.46" />
      <line x1="1" y1="8" x2="3" y2="8" />
      <line x1="3.05" y1="12.95" x2="4.46" y2="11.54" />
      <path d="M18 14h-1.26A6 6 0 0 0 9 16h9a4 4 0 0 0 0-8h-.34" />
      <path d="M7 16a6 6 0 0 1 1.26-3.73" />
    </svg>
  )
}

function RainIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
      <line x1="8" y1="19" x2="8" y2="22" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="16" y1="19" x2="16" y2="22" />
    </svg>
  )
}

function SnowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
      <line x1="8" y1="15" x2="8" y2="15.01" />
      <line x1="12" y1="17" x2="12" y2="17.01" />
      <line x1="16" y1="15" x2="16" y2="15.01" />
      <line x1="10" y1="20" x2="10" y2="20.01" />
      <line x1="14" y1="20" x2="14" y2="20.01" />
    </svg>
  )
}

function ThunderstormIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
      <polyline points="13 16 11 20 15 20 13 24" />
    </svg>
  )
}

function FogIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
      <line x1="6" y1="21" x2="18" y2="21" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  )
}

function LocationPinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" className={className} width={16} height={16}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

/* ---------- helpers ---------- */

function getWeatherSvg(code: number): React.FC<{ className?: string }> {
  if (code === 0) return SunIcon
  if ([1, 2, 3].includes(code)) return PartlyCloudyIcon
  if ([45, 48].includes(code)) return FogIcon
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return RainIcon
  if ([71, 73, 75, 77, 85, 86].includes(code)) return SnowIcon
  if ([95, 96, 99].includes(code)) return ThunderstormIcon
  return PartlyCloudyIcon
}

function getWeatherDescription(code: number): string {
  if (code === 0) return 'Céu limpo'
  if ([1, 2, 3].includes(code)) return 'Parcialmente nublado'
  if ([45, 48].includes(code)) return 'Nevoeiro'
  if ([51, 53, 55].includes(code)) return 'Chuvisco'
  if ([61, 63, 65, 80, 81, 82].includes(code)) return 'Chuva'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Neve'
  if ([95, 96, 99].includes(code)) return 'Tempestade'
  return 'Parcialmente nublado'
}

function getDayName(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
}

export default function WeatherWidget({ latitude, longitude, destinationName }: WeatherWidgetProps) {
  const [days, setDays] = useState<WeatherDay[]>([])
  const [currentTemp, setCurrentTemp] = useState<number | null>(null)
  const [currentCode, setCurrentCode] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchWeather() {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=5`
        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok) throw new Error('Weather API error')
        const data = await res.json()

        // Current weather
        if (data.current) {
          setCurrentTemp(Math.round(data.current.temperature_2m))
          setCurrentCode(data.current.weathercode)
        }

        const weatherDays: WeatherDay[] = data.daily.time.map((date: string, i: number) => ({
          date,
          dayName: getDayName(date),
          maxTemp: Math.round(data.daily.temperature_2m_max[i]),
          minTemp: Math.round(data.daily.temperature_2m_min[i]),
          weatherCode: data.daily.weathercode[i],
        }))
        setDays(weatherDays)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchWeather()
  }, [latitude, longitude])

  if (error) return null

  const displayTemp = currentTemp ?? (days.length > 0 ? days[0].maxTemp : null)
  const displayCode = currentCode ?? (days.length > 0 ? days[0].weatherCode : null)
  const CurrentWeatherIcon = displayCode !== null ? getWeatherSvg(displayCode) : SunIcon

  return (
    <Card padding="none" className="overflow-hidden border-brand-border">
      {/* Header */}
      <div className="px-5 py-5 bg-brand-bg border-b border-brand-border">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <LocationPinIcon className="text-brand-gold" />
              <p className="font-inter text-xs text-brand-muted">{destinationName}</p>
            </div>
            {displayTemp !== null && (
              <>
                <h3 className="font-cormorant text-4xl font-semibold text-brand-title leading-none">
                  {displayTemp}°C
                </h3>
                {displayCode !== null && (
                  <p className="font-outfit text-sm text-brand-muted mt-1">
                    {getWeatherDescription(displayCode)}
                  </p>
                )}
              </>
            )}
          </div>
          {displayCode !== null && (
            <div className="w-14 h-14 flex items-center justify-center">
              <CurrentWeatherIcon className="w-12 h-12 text-brand-gold" />
            </div>
          )}
        </div>
      </div>

      {/* 5-day Forecast */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="w-5 h-5 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-2">
            {days.map((day) => {
              const DayIcon = getWeatherSvg(day.weatherCode)
              return (
                <div
                  key={day.date}
                  className="flex flex-col items-center gap-1.5 py-2 px-1 rounded-lg bg-white border border-brand-border/60"
                >
                  <span className="font-inter text-[11px] text-brand-muted capitalize">{day.dayName}</span>
                  <DayIcon className="w-6 h-6 text-brand-gold" />
                  <div className="text-center leading-tight">
                    <span className="font-inter text-sm font-semibold text-brand-title">{day.maxTemp}°</span>
                    <span className="font-inter text-[11px] text-brand-muted ml-0.5">{day.minTemp}°</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 border-t border-brand-border bg-brand-bg">
        <p className="font-inter text-[11px] text-brand-muted">
          Previsão detalhada · {destinationName}
        </p>
      </div>
    </Card>
  )
}
