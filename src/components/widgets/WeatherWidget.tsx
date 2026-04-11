'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'

interface WeatherDay {
  date: string
  dayName: string
  maxTemp: number
  minTemp: number
  weatherCode: number
  icon: string
}

interface WeatherWidgetProps {
  latitude: number
  longitude: number
  destinationName: string
}

function getWeatherIcon(code: number): string {
  if (code === 0) return '☀️'
  if ([1, 2, 3].includes(code)) return '🌤️'
  if ([45, 48].includes(code)) return '🌫️'
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return '🌧️'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '🌨️'
  if ([95, 96, 99].includes(code)) return '⛈️'
  return '🌤️'
}

function getWeatherDescription(code: number): string {
  if (code === 0) return 'Céu limpo'
  if ([1, 2, 3].includes(code)) return 'Parcialmente nublado'
  if ([45, 48].includes(code)) return 'Nevoeiro'
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'Chuva'
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchWeather() {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=5`
        const res = await fetch(url)
        if (!res.ok) throw new Error('Weather API error')
        const data = await res.json()

        const weatherDays: WeatherDay[] = data.daily.time.map((date: string, i: number) => ({
          date,
          dayName: getDayName(date),
          maxTemp: Math.round(data.daily.temperature_2m_max[i]),
          minTemp: Math.round(data.daily.temperature_2m_min[i]),
          weatherCode: data.daily.weathercode[i],
          icon: getWeatherIcon(data.daily.weathercode[i]),
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

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-inter text-xs uppercase tracking-wider opacity-80">Weather</p>
            <h3 className="font-cormorant text-xl font-semibold">{destinationName}</h3>
          </div>
          {days.length > 0 && (
            <div className="text-right">
              <span className="text-3xl font-semibold font-inter">{days[0].maxTemp}°</span>
              <p className="font-inter text-xs opacity-80">{getWeatherDescription(days[0].weatherCode)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Forecast */}
      <div className="px-5 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="w-5 h-5 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex justify-between">
            {days.map((day) => (
              <div key={day.date} className="flex flex-col items-center gap-1.5">
                <span className="font-inter text-xs text-brand-muted capitalize">{day.dayName}</span>
                <span className="text-2xl">{day.icon}</span>
                <div className="text-center">
                  <span className="font-inter text-sm font-semibold text-brand-title">{day.maxTemp}°</span>
                  <span className="font-inter text-xs text-brand-muted ml-1">{day.minTemp}°</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-brand-border bg-brand-bg">
        <p className="font-inter text-xs text-brand-muted">
          Previsão detalhada do tempo para {destinationName}
        </p>
      </div>
    </Card>
  )
}
