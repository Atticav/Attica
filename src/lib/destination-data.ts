// src/lib/destination-data.ts

export interface DestinationInfo {
  destination: string
  country: string
  language: string
  currency: string
  currencySymbol: string
  voltage: string
  timezoneOffset: string // e.g., "-2 horas do Brasil"
  bestSeason: string
  travelStyle?: string
}

// Static data — admin can extend this or move to Supabase later
const DESTINATIONS: Record<string, DestinationInfo> = {
  'peru': {
    destination: 'Peru',
    country: 'Peru',
    language: 'Espanhol',
    currency: 'Sol Peruano',
    currencySymbol: 'PEN',
    voltage: '220v',
    timezoneOffset: '-2 horas do Brasil',
    bestSeason: 'Maio a Setembro',
    travelStyle: 'Aventura',
  },
  'italia': {
    destination: 'Itália',
    country: 'Itália',
    language: 'Italiano',
    currency: 'Euro',
    currencySymbol: 'EUR',
    voltage: '230v',
    timezoneOffset: '+4 horas do Brasil',
    bestSeason: 'Abril a Outubro',
    travelStyle: 'Cultural',
  },
  'itália': {
    destination: 'Itália',
    country: 'Itália',
    language: 'Italiano',
    currency: 'Euro',
    currencySymbol: 'EUR',
    voltage: '230v',
    timezoneOffset: '+4 horas do Brasil',
    bestSeason: 'Abril a Outubro',
    travelStyle: 'Cultural',
  },
  'portugal': {
    destination: 'Portugal',
    country: 'Portugal',
    language: 'Português',
    currency: 'Euro',
    currencySymbol: 'EUR',
    voltage: '230v',
    timezoneOffset: '+3 horas do Brasil',
    bestSeason: 'Março a Outubro',
    travelStyle: 'Descanso',
  },
  'maragogi': {
    destination: 'Maragogi',
    country: 'Brasil',
    language: 'Português',
    currency: 'Real',
    currencySymbol: 'BRL',
    voltage: '220v',
    timezoneOffset: '-1 hora de Brasília',
    bestSeason: 'Setembro a Dezembro',
    travelStyle: 'Descanso',
  },
  'paris': {
    destination: 'Paris',
    country: 'França',
    language: 'Francês',
    currency: 'Euro',
    currencySymbol: 'EUR',
    voltage: '230v',
    timezoneOffset: '+4 horas do Brasil',
    bestSeason: 'Abril a Outubro',
    travelStyle: 'Cultural',
  },
  'frança': {
    destination: 'França',
    country: 'França',
    language: 'Francês',
    currency: 'Euro',
    currencySymbol: 'EUR',
    voltage: '230v',
    timezoneOffset: '+4 horas do Brasil',
    bestSeason: 'Abril a Outubro',
    travelStyle: 'Cultural',
  },
  'franca': {
    destination: 'França',
    country: 'França',
    language: 'Francês',
    currency: 'Euro',
    currencySymbol: 'EUR',
    voltage: '230v',
    timezoneOffset: '+4 horas do Brasil',
    bestSeason: 'Abril a Outubro',
    travelStyle: 'Cultural',
  },
  'japão': {
    destination: 'Japão',
    country: 'Japão',
    language: 'Japonês',
    currency: 'Iene',
    currencySymbol: 'JPY',
    voltage: '100v',
    timezoneOffset: '+12 horas do Brasil',
    bestSeason: 'Março a Maio / Setembro a Novembro',
    travelStyle: 'Cultural',
  },
  'japao': {
    destination: 'Japão',
    country: 'Japão',
    language: 'Japonês',
    currency: 'Iene',
    currencySymbol: 'JPY',
    voltage: '100v',
    timezoneOffset: '+12 horas do Brasil',
    bestSeason: 'Março a Maio / Setembro a Novembro',
    travelStyle: 'Cultural',
  },
  'argentina': {
    destination: 'Argentina',
    country: 'Argentina',
    language: 'Espanhol',
    currency: 'Peso Argentino',
    currencySymbol: 'ARS',
    voltage: '220v',
    timezoneOffset: 'Mesmo horário do Brasil',
    bestSeason: 'Setembro a Novembro / Março a Maio',
    travelStyle: 'Cultural',
  },
  'grécia': {
    destination: 'Grécia',
    country: 'Grécia',
    language: 'Grego',
    currency: 'Euro',
    currencySymbol: 'EUR',
    voltage: '230v',
    timezoneOffset: '+5 horas do Brasil',
    bestSeason: 'Maio a Outubro',
    travelStyle: 'Descanso',
  },
  'grecia': {
    destination: 'Grécia',
    country: 'Grécia',
    language: 'Grego',
    currency: 'Euro',
    currencySymbol: 'EUR',
    voltage: '230v',
    timezoneOffset: '+5 horas do Brasil',
    bestSeason: 'Maio a Outubro',
    travelStyle: 'Descanso',
  },
  'espanha': {
    destination: 'Espanha',
    country: 'Espanha',
    language: 'Espanhol',
    currency: 'Euro',
    currencySymbol: 'EUR',
    voltage: '230v',
    timezoneOffset: '+4 horas do Brasil',
    bestSeason: 'Abril a Outubro',
    travelStyle: 'Cultural',
  },
  'estados unidos': {
    destination: 'Estados Unidos',
    country: 'Estados Unidos',
    language: 'Inglês',
    currency: 'Dólar',
    currencySymbol: 'USD',
    voltage: '120v',
    timezoneOffset: '-2 a -5 horas do Brasil',
    bestSeason: 'Todo o ano',
    travelStyle: 'Aventura',
  },
  'eua': {
    destination: 'Estados Unidos',
    country: 'Estados Unidos',
    language: 'Inglês',
    currency: 'Dólar',
    currencySymbol: 'USD',
    voltage: '120v',
    timezoneOffset: '-2 a -5 horas do Brasil',
    bestSeason: 'Todo o ano',
    travelStyle: 'Aventura',
  },
  'nova york': {
    destination: 'Nova York',
    country: 'Estados Unidos',
    language: 'Inglês',
    currency: 'Dólar',
    currencySymbol: 'USD',
    voltage: '120v',
    timezoneOffset: '-2 horas do Brasil',
    bestSeason: 'Abril a Junho / Setembro a Novembro',
    travelStyle: 'Cultural',
  },
  'miami': {
    destination: 'Miami',
    country: 'Estados Unidos',
    language: 'Inglês',
    currency: 'Dólar',
    currencySymbol: 'USD',
    voltage: '120v',
    timezoneOffset: '-2 horas do Brasil',
    bestSeason: 'Novembro a Abril',
    travelStyle: 'Descanso',
  },
}

export function getDestinationInfo(destination: string, country?: string): DestinationInfo | null {
  const key = destination.toLowerCase().trim()

  // Try exact match
  if (DESTINATIONS[key]) return DESTINATIONS[key]

  // Try country match
  if (country) {
    const countryKey = country.toLowerCase().trim()
    if (DESTINATIONS[countryKey]) return DESTINATIONS[countryKey]
  }

  // Try partial match
  for (const [k, v] of Object.entries(DESTINATIONS)) {
    if (key.includes(k) || k.includes(key)) return v
  }

  return null
}
