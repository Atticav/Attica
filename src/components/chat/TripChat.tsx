'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageCircle, X, Send, ChevronDown, ArrowLeftRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { TripMessage } from '@/lib/types'
import { cn } from '@/lib/utils'

interface TripChatProps {
  tripId: string
  userId: string
  userRole: 'admin' | 'client'
  embedded?: boolean
}

const CHAT_POSITION_STORAGE_KEY = 'attica-chat-position'

export default function TripChat({ tripId, userId, userRole, embedded = false }: TripChatProps) {
  const [open, setOpen] = useState(embedded)
  const [chatPosition, setChatPosition] = useState<'left' | 'right'>('right')
  const [messages, setMessages] = useState<TripMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const loadMessages = useCallback(async () => {
    const { data } = await supabase
      .from('trip_messages')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true })
    if (data) setMessages(data as TripMessage[])
  }, [tripId, supabase])

  const markAsRead = useCallback(async () => {
    await supabase
      .from('trip_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('trip_id', tripId)
      .neq('sender_role', userRole)
      .is('read_at', null)
    setUnreadCount(0)
  }, [tripId, userRole, supabase])

  const countUnread = useCallback(async () => {
    const { count } = await supabase
      .from('trip_messages')
      .select('*', { count: 'exact', head: true })
      .eq('trip_id', tripId)
      .neq('sender_role', userRole)
      .is('read_at', null)
    setUnreadCount(count ?? 0)
  }, [tripId, userRole, supabase])

  useEffect(() => {
    if (embedded) return
    try {
      const stored = window.localStorage.getItem(CHAT_POSITION_STORAGE_KEY)
      if (stored === 'left' || stored === 'right') setChatPosition(stored)
    } catch {
      // ignore storage read errors
    }
  }, [embedded])

  useEffect(() => {
    loadMessages()
    countUnread()

    const channel = supabase
      .channel(`trip_chat_${tripId}_${userRole}_${Math.random()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trip_messages',
          filter: `trip_id=eq.${tripId}`,
        },
        (payload) => {
          const newMsg = payload.new as TripMessage
          setMessages((prev) => [...prev, newMsg])
          if (newMsg.sender_role !== userRole) {
            if (open) {
              markAsRead()
            } else {
              setUnreadCount((prev) => prev + 1)
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId, userRole])

  useEffect(() => {
    if (open) {
      markAsRead()
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }, [open, messages, markAsRead])

  async function sendMessage() {
    if (!input.trim() || sending) return
    setSending(true)
    const content = input.trim()
    setInput('')
    await supabase.from('trip_messages').insert({
      trip_id: tripId,
      sender_id: userId,
      sender_role: userRole,
      content,
    })
    setSending(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  function togglePosition() {
    setChatPosition(prev => {
      const next = prev === 'right' ? 'left' : 'right'
      try {
        window.localStorage.setItem(CHAT_POSITION_STORAGE_KEY, next)
      } catch {
        // ignore storage write errors
      }
      return next
    })
  }

  const chatBody = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-brand-gold flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageCircle size={18} strokeWidth={1.5} className="text-white" />
          <span className="font-inter text-sm font-semibold text-white">
            {userRole === 'client' ? 'Falar com a Attica' : 'Chat com o cliente'}
          </span>
        </div>
        {!embedded && (
          <button
            onClick={() => setOpen(false)}
            className="text-white/80 hover:text-white transition-colors"
          >
            <ChevronDown size={20} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-brand-bg">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <p className="font-outfit text-sm text-brand-muted text-center px-4">
              {userRole === 'client'
                ? 'Envie uma mensagem para a Attica Viagens. Respondemos em breve! 🌍'
                : 'Nenhuma mensagem ainda.'}
            </p>
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.sender_role === userRole
          return (
            <div
              key={msg.id}
              className={cn('flex flex-col gap-0.5', isOwn ? 'items-end' : 'items-start')}
            >
              {!isOwn && (
                <span className="font-inter text-xs text-brand-muted px-1">
                  {userRole === 'client' ? 'Attica Viagens' : 'Cliente'}
                </span>
              )}
              <div
                className={cn(
                  'max-w-[75%] px-3 py-2 rounded-2xl font-outfit text-sm leading-relaxed break-words',
                  isOwn
                    ? 'bg-brand-gold text-white rounded-br-sm'
                    : 'bg-white text-brand-text border border-brand-border rounded-bl-sm shadow-sm'
                )}
              >
                {msg.content}
              </div>
              <span className="font-inter text-[10px] text-brand-muted px-1">
                {formatTime(msg.created_at)}
              </span>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-end gap-2 px-3 py-3 border-t border-brand-border bg-white flex-shrink-0">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem... (Enter para enviar)"
          rows={1}
          className="flex-1 resize-none rounded-xl border border-brand-border font-outfit text-sm text-brand-text bg-brand-bg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold placeholder:text-brand-muted max-h-24 overflow-y-auto"
          style={{ minHeight: '40px' }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          className="p-2.5 rounded-xl bg-brand-gold text-white hover:bg-brand-gold-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        >
          <Send size={16} strokeWidth={2} />
        </button>
      </div>
    </>
  )

  if (embedded) {
    return (
      <div className="w-full h-full bg-white rounded-2xl border border-brand-border shadow-card flex flex-col overflow-hidden">
        {chatBody}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'fixed bottom-6 z-50 flex flex-col gap-3',
        chatPosition === 'right' ? 'right-4 sm:right-6 items-end' : 'left-4 sm:left-6 items-start'
      )}
    >
      {open && (
        <div
          className={cn(
            'w-[min(24rem,calc(100vw-2rem))] bg-white rounded-2xl shadow-2xl border border-brand-border flex flex-col overflow-hidden',
            chatPosition === 'right' ? 'origin-bottom-right' : 'origin-bottom-left'
          )}
          style={{ height: '480px' }}
        >
          {chatBody}
        </div>
      )}

      {/* Floating button */}
      <div className={cn('relative flex items-center gap-2', chatPosition === 'right' ? 'flex-row' : 'flex-row-reverse')}>
        <button
          onClick={togglePosition}
          className="w-9 h-9 rounded-full border border-brand-border bg-white text-brand-muted hover:text-brand-gold hover:border-brand-gold transition-colors flex items-center justify-center shadow-sm"
          title={chatPosition === 'right' ? 'Mover chat para a esquerda' : 'Mover chat para a direita'}
          aria-label={chatPosition === 'right' ? 'Mover chat para a esquerda' : 'Mover chat para a direita'}
        >
          <ArrowLeftRight size={14} strokeWidth={1.8} />
        </button>
        <button
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            'w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200',
            open ? 'bg-gray-500' : 'bg-brand-gold hover:bg-brand-gold-dark'
          )}
          title={userRole === 'client' ? 'Falar com a Attica' : 'Chat com o cliente'}
        >
          {open ? (
            <X size={22} strokeWidth={1.5} className="text-white" />
          ) : (
            <MessageCircle size={22} strokeWidth={1.5} className="text-white" />
          )}
        </button>
        {!open && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center pointer-events-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>
    </div>
  )
}
