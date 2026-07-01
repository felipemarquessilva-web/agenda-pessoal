'use client'

import { useState, useTransition } from 'react'
import { sendTestEmail } from '../actions/tasks'

export default function TestEmailButton() {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTest = () => {
    setMessage(null)
    setError(null)
    startTransition(async () => {
      const res = await sendTestEmail()
      if (res.success) {
        setMessage('E-mail enviado! Verifique sua caixa de entrada.')
        setTimeout(() => setMessage(null), 5000)
      } else {
        setError(res.error || 'Erro ao enviar e-mail.')
        setTimeout(() => setError(null), 7000)
      }
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
      <button
        onClick={handleTest}
        disabled={isPending}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-sm)',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: isPending ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          opacity: isPending ? 0.6 : 1
        }}
        onMouseOver={(e) => {
          if (!isPending) e.currentTarget.style.backgroundColor = 'var(--border-color)'
        }}
        onMouseOut={(e) => {
          if (!isPending) e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
        }}
      >
        <span>✉️</span>
        {isPending ? 'Enviando Teste...' : 'Testar E-mail Diário'}
      </button>
      
      {message && (
        <span style={{ fontSize: '0.75rem', color: 'var(--cat-academic)', fontWeight: '500' }}>
          {message}
        </span>
      )}
      
      {error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--accent-danger)', fontWeight: '500' }}>
          ⚠️ {error}
        </span>
      )}
    </div>
  )
}
