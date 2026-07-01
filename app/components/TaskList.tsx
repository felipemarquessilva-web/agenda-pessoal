'use client'

import { useState, useEffect } from 'react'
import TaskItem from './TaskItem'

export default function TaskList({ tasks }: { tasks: any[] }) {
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  
  // Inicia mostrando as tarefas de Hoje
  const [filter, setFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'SPECIFIC'>('TODAY')
  const [specificDate, setSpecificDate] = useState<string>(todayStr)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  const filteredTasks = tasks.filter(task => {
    if (filter === 'ALL') return true;
    
    if (!task.dueDate) return false; 
    
    const dueDate = new Date(task.dueDate)
    
    if (filter === 'TODAY') {
      return dueDate.toDateString() === now.toDateString()
    }
    
    if (filter === 'WEEK') {
      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays >= -1 && diffDays <= 7;
    }
    
    if (filter === 'MONTH') {
      return dueDate.getMonth() === now.getMonth() && dueDate.getFullYear() === now.getFullYear()
    }

    if (filter === 'SPECIFIC' && specificDate) {
      const selected = new Date(specificDate + 'T12:00:00Z')
      return dueDate.toDateString() === selected.toDateString()
    }
    
    return true;
  })

  const changeSpecificDay = (daysAmount: number) => {
    const current = new Date(specificDate + 'T12:00:00Z')
    current.setDate(current.getDate() + daysAmount)
    setSpecificDate(current.toISOString().split('T')[0])
    setFilter('SPECIFIC')
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '1.5rem', 
        overflowX: 'auto', 
        paddingBottom: '0.5rem',
        scrollbarWidth: 'none',
        alignItems: 'center'
      }}>
        <FilterButton active={filter === 'ALL'} onClick={() => { setFilter('ALL'); }}>Todas</FilterButton>
        <FilterButton active={filter === 'TODAY'} onClick={() => { setFilter('TODAY'); setSpecificDate(todayStr); }}>Hoje</FilterButton>
        <FilterButton active={filter === 'WEEK'} onClick={() => { setFilter('WEEK'); setSpecificDate(todayStr); }}>Próx. 7 Dias</FilterButton>
        <FilterButton active={filter === 'MONTH'} onClick={() => { setFilter('MONTH'); setSpecificDate(todayStr); }}>Este Mês</FilterButton>
        
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '0.5rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem', gap: '0.25rem' }}>
          <button 
            onClick={() => changeSpecificDay(-1)}
            style={{
              padding: '0.4rem 0.6rem',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Dia Anterior"
          >
            ◀
          </button>
          
          <input 
            type="date"
            value={specificDate}
            onChange={(e) => {
              setSpecificDate(e.target.value)
              if (e.target.value) setFilter('SPECIFIC')
              else setFilter('ALL')
            }}
            title="Escolha um dia específico"
            style={{
              padding: '0.4rem 0.75rem',
              backgroundColor: filter === 'SPECIFIC' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: filter === 'SPECIFIC' ? '#fff' : 'var(--text-primary)',
              border: '1px solid',
              borderColor: filter === 'SPECIFIC' ? 'var(--accent-primary)' : 'var(--border-color)',
              borderRadius: '4px',
              outline: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              transition: 'all 0.2s',
              fontWeight: filter === 'SPECIFIC' ? '600' : '400'
            }}
          />

          <button 
            onClick={() => changeSpecificDay(1)}
            style={{
              padding: '0.4rem 0.6rem',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Próximo Dia"
          >
            ▶
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Suas Tarefas</h2>
        <span className="text-muted" style={{ fontSize: '0.875rem' }}>{filteredTasks.length} total</span>
      </div>
      
      {!mounted ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p className="text-muted">Carregando tarefas...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem', 
          backgroundColor: 'var(--bg-secondary)', 
          borderRadius: 'var(--border-radius-md)', 
          border: '1px dashed var(--border-color)' 
        }}>
          <p className="text-muted">Nenhuma tarefa encontrada para este filtro.</p>
        </div>
      ) : (
        <div>
          {filteredTasks.map((task: any) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterButton({ active, onClick, children }: any) {
  return (
    <button 
      onClick={onClick}
      style={{
        padding: '0.5rem 1rem',
        backgroundColor: active ? 'var(--accent-primary)' : 'var(--bg-secondary)',
        color: active ? '#fff' : 'var(--text-primary)',
        border: '1px solid',
        borderColor: active ? 'var(--accent-primary)' : 'var(--border-color)',
        borderRadius: '99px',
        fontSize: '0.875rem',
        fontWeight: active ? '600' : '400',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s',
        cursor: 'pointer'
      }}
    >
      {children}
    </button>
  )
}
