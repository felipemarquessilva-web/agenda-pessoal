'use client'

import { signOut } from "next-auth/react"

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut()}
      style={{
        padding: '0.5rem 1rem',
        backgroundColor: 'transparent',
        border: '1px solid var(--border-color)',
        color: 'var(--text-primary)',
        borderRadius: 'var(--border-radius-sm)',
        fontSize: '0.875rem',
        transition: 'var(--transition-fast)'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      Sair
    </button>
  )
}
