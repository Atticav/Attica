'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { LANGUAGES } from '@/lib/i18n/translations'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const loadProfile = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('id', user.id)
      .single()

    if (data) {
      setFullName(data.full_name || '')
      setPhone(data.phone || '')
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadProfile() }, [loadProfile])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    try {
      const res = await fetch('/api/client/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, phone }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 lg:pt-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
            <p className="font-inter text-sm text-brand-muted">{t.common.loading}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 lg:pt-8">
      <h1 className="font-cormorant text-3xl font-semibold text-brand-title mb-6">
        {t.settings.title}
      </h1>

      {/* Language Section */}
      <Card className="mb-6">
        <h2 className="font-cormorant text-xl font-semibold text-brand-title mb-4">
          {t.settings.languageSection}
        </h2>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg font-inter text-sm transition-all',
                language === lang.code
                  ? 'border-2 border-brand-gold bg-brand-hover text-brand-gold-dark font-medium shadow-gold'
                  : 'border border-brand-border text-brand-text hover:bg-brand-bg hover:border-brand-gold/50'
              )}
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Profile Section */}
      <Card>
        <h2 className="font-cormorant text-xl font-semibold text-brand-title mb-4">
          {t.settings.profileSection}
        </h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-sm font-medium text-brand-text">
              {t.settings.fullName}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent placeholder:text-brand-muted"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-sm font-medium text-brand-text">
              {t.settings.phone}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent placeholder:text-brand-muted"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" loading={saving}>
              {saving ? t.settings.saving : t.common.save}
            </Button>
            {saved && (
              <span className="font-inter text-sm text-green-600">
                ✓ {t.settings.saved}
              </span>
            )}
          </div>
        </form>
      </Card>
    </div>
  )
}
