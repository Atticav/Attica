import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { DESTINATIONS } from './destinations-data'
import type { Destination } from './types'

// ===== CLASSNAMES =====

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ===== FORMATAÇÃO DE DATA =====

export function formatDate(
  date: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return '—'

  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date

  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    ...options,
  })
}

export function formatDateShort(date: string | Date | null | undefined): string {
  return formatDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateRange(
  startDate: string | null,
  endDate: string | null
): string {
  if (!startDate && !endDate) return 'Datas a definir'
  if (!startDate) return `Até ${formatDateShort(endDate)}`
  if (!endDate) return `A partir de ${formatDateShort(startDate)}`

  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')

  if (start.getFullYear() === end.getFullYear()) {
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} a ${formatDateShort(endDate)}`
    }
    return `${start.getDate()}/${start.getMonth() + 1} a ${formatDateShort(endDate)}`
  }

  return `${formatDateShort(startDate)} a ${formatDateShort(endDate)}`
}

export function getTripDuration(
  startDate: string | null,
  endDate: string | null
): number | null {
  if (!startDate || !endDate) return null

  const start = new Date(startDate)
  const end = new Date(endDate)
  const diff = end.getTime() - start.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1
}

// ===== FORMATAÇÃO DE MOEDA =====

export function formatCurrency(
  amount: number | null | undefined,
  currency: string = 'BRL'
): string {
  if (amount === null || amount === undefined) return '—'

  const locales: Record<string, string> = {
    BRL: 'pt-BR',
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
    JPY: 'ja-JP',
    ARS: 'es-AR',
    CLP: 'es-CL',
  }

  const locale = locales[currency] || 'pt-BR'

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'JPY' ? 0 : 2,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
  }).format(amount)
}

// ===== DESTINOS =====

export function getDestinationData(query: string): Destination | undefined {
  if (!query) return undefined
  return DESTINATIONS.find(
    (d) =>
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.country.toLowerCase().includes(query.toLowerCase()) ||
      d.capital.toLowerCase().includes(query.toLowerCase())
  )
}

export function searchDestinations(query: string): Destination[] {
  if (!query || query.length < 2) return []
  const q = query.toLowerCase()
  return DESTINATIONS.filter(
    (d) =>
      d.name.toLowerCase().includes(q) ||
      d.country.toLowerCase().includes(q) ||
      d.capital.toLowerCase().includes(q)
  ).slice(0, 10)
}

// ===== STATUS HELPERS =====

export function getTripStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    planning: 'Planejamento',
    confirmed: 'Confirmada',
    in_progress: 'Em andamento',
    completed: 'Concluída',
    cancelled: 'Cancelada',
  }
  return labels[status] || status
}

export function getTripStatusColor(status: string): string {
  const colors: Record<string, string> = {
    planning: 'warning',
    confirmed: 'gold',
    in_progress: 'success',
    completed: 'neutral',
    cancelled: 'error',
  }
  return colors[status] || 'neutral'
}

// ===== HELPERS GERAIS =====

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '…'
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim()
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}
