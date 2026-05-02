export const LITTLE_LANGUAGE_URL = 'https://www.littlelanguage.com'

export const LANG_LABELS: Record<string, string> = {
  es: 'Espanhol',
  en: 'Inglês',
  fr: 'Francês',
  it: 'Italiano',
  de: 'Alemão',
  ja: 'Japonês',
  pt: 'Português',
}

export const LANG_SPEECH_CODES: Record<string, string> = {
  es: 'es-ES',
  fr: 'fr-FR',
  it: 'it-IT',
  de: 'de-DE',
  ja: 'ja-JP',
  pt: 'pt-BR',
  en: 'en-US',
}

export function getLanguageCode(destination: string, country: string): string {
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

export function speak(text: string, langCode: string): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const targetLang = LANG_SPEECH_CODES[langCode] || 'en-US'
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = targetLang
  utterance.rate = 0.8

  const selectVoiceAndSpeak = () => {
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      const baseLang = targetLang.split('-')[0]
      const voice =
        voices.find(v => v.lang === targetLang) ||
        voices.find(v => v.lang.startsWith(baseLang))
      if (voice) utterance.voice = voice
    }
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener('voiceschanged', selectVoiceAndSpeak, { once: true })
  } else {
    selectVoiceAndSpeak()
  }
}
