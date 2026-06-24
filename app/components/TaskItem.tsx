'use client'

import { toggleTask, deleteTask } from '../actions/tasks'
import { useTransition } from 'react'

type TaskProps = {
  task: {
    id: string;
    title: string;
    category: string;
    isCompleted: boolean;
    dueDate?: Date | null;
  }
}

const catColors: Record<string, string> = {
  PROFESSIONAL: 'var(--cat-professional)',
  ACADEMIC: 'var(--cat-academic)',
  PERSONAL: 'var(--cat-personal)'
}

const catLabels: Record<string, string> = {
  PROFESSIONAL: 'Profissional',
  ACADEMIC: 'Acadêmica',
  PERSONAL: 'Pessoal'
}

export default function TaskItem({ task }: TaskProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.5rem',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--border-radius-md)',
        marginBottom: '0.75rem',
        border: '1px solid var(--border-color)',
        opacity: task.isCompleted ? 0.6 : 1,
        transition: 'var(--transition-normal)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
        <input 
          type="checkbox" 
          checked={task.isCompleted}
          onChange={() => startTransition(() => toggleTask(task.id, task.isCompleted))}
          style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ 
            fontSize: '1.1rem', 
            fontWeight: '500',
            textDecoration: task.isCompleted ? 'line-through' : 'none',
            color: task.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)'
          }}>
            {task.title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
            <span style={{
              fontSize: '0.75rem',
              padding: '0.2rem 0.6rem',
              backgroundColor: `${catColors[task.category]}20`,
              color: catColors[task.category],
              borderRadius: '99px',
              fontWeight: '600',
              display: 'inline-block'
            }}>
              {catLabels[task.category]}
            </span>
            {task.dueDate && (
              <span style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                🕒 {new Date(task.dueDate).toLocaleString('pt-BR', { 
                  day: '2-digit', month: '2-digit', year: 'numeric', 
                  hour: '2-digit', minute: '2-digit' 
                })}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <button
        onClick={() => {
          if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            startTransition(() => deleteTask(task.id))
          }
        }}
        style={{
          color: 'var(--accent-danger)',
          padding: '0.5rem',
          borderRadius: 'var(--border-radius-sm)',
          opacity: 0.7,
          marginLeft: '1rem'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.opacity = '1'
          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.opacity = '0.7'
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </div>
  )
}
