'use client'

import { useRef } from 'react'
import { createTask } from '../actions/tasks'

export default function TaskForm() {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form 
      ref={formRef}
      action={async (formData) => {
        const dueDate = formData.get('dueDate') as string
        if (dueDate) {
          // Converte a data local do navegador para uma string ISO (UTC)
          // Isso garante que o servidor salve o momento exato
          const localDate = new Date(dueDate)
          formData.set('dueDate', localDate.toISOString())
        }
        await createTask(formData)
        formRef.current?.reset()
      }}
      style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        backgroundColor: 'var(--bg-secondary)',
        padding: '1.5rem',
        borderRadius: 'var(--border-radius-md)',
        border: '1px solid var(--border-color)',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}
    >
      <input 
        type="text" 
        name="title"
        placeholder="O que você precisa fazer?" 
        required
        style={{
          flex: 2,
          minWidth: '200px',
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-sm)',
          color: 'var(--text-primary)',
          fontSize: '1rem',
          outline: 'none',
        }}
      />
      <input 
        type="datetime-local" 
        name="dueDate"
        title="Data e Hora"
        style={{
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-sm)',
          color: 'var(--text-primary)',
          fontSize: '1rem',
          outline: 'none',
          cursor: 'pointer'
        }}
      />
      <select 
        name="category"
        required
        style={{
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-sm)',
          color: 'var(--text-primary)',
          fontSize: '1rem',
          outline: 'none',
          cursor: 'pointer'
        }}
      >
        <option value="PROFESSIONAL">Profissional</option>
        <option value="ACADEMIC">Acadêmica</option>
        <option value="PERSONAL">Pessoal</option>
      </select>
      <select 
        name="reminderMinutes"
        title="Definir Lembrete por E-mail"
        style={{
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-sm)',
          color: 'var(--text-primary)',
          fontSize: '1rem',
          outline: 'none',
          cursor: 'pointer'
        }}
      >
        <option value="NONE">Sem lembrete</option>
        <option value="15">15 minutos antes</option>
        <option value="60">1 hora antes</option>
        <option value="1440">1 dia antes</option>
      </select>
      <button 
        type="submit"
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: 'var(--accent-primary)',
          color: '#fff',
          borderRadius: 'var(--border-radius-sm)',
          fontWeight: '600',
          transition: 'var(--transition-fast)',
          flexShrink: 0
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
      >
        Adicionar
      </button>
    </form>
  )
}
