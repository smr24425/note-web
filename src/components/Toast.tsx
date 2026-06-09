import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onDismiss: () => void
}

export function Toast({ message, type = 'success', duration = 2500, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 300)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onDismiss])

  return (
    <div
      className="fixed bottom-8 left-1/2 z-[200] px-5 py-3 rounded-2xl text-sm font-medium pointer-events-none"
      style={{
        transform: `translateX(-50%) translateY(${visible ? '0' : '12px'})`,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        background: type === 'error' ? 'var(--color-danger)' : 'var(--color-list-text)',
        color: type === 'error' ? '#fff' : 'var(--color-editor-bg)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      }}
    >
      {message}
    </div>
  )
}

// ─── useToast hook ────────────────────────────────────────────

interface ToastState {
  id: number
  message: string
  type: ToastType
}

import { useState as useS, useCallback } from 'react'

export function useToast() {
  const [toast, setToast] = useS<ToastState | null>(null)

  const show = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ id: Date.now(), message, type })
  }, [])

  const dismiss = useCallback(() => setToast(null), [])

  const toastEl = toast ? (
    <Toast
      key={toast.id}
      message={toast.message}
      type={toast.type}
      onDismiss={dismiss}
    />
  ) : null

  return { show, toastEl }
}
