import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { getTasks } from "./actions/tasks"
import TaskForm from "./components/TaskForm"
import TaskList from "./components/TaskList"
import LogoutButton from "./components/LogoutButton"
import TestEmailButton from "./components/TestEmailButton"

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  const tasks = await getTasks()

  return (
    <div className="main-content">
      <header style={{
        padding: '1.5rem',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ fontWeight: '600', fontSize: '1.25rem' }}>Agenda Pessoal</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="text-muted" style={{ fontSize: '0.875rem' }}>Olá, {session.user?.name}</span>
          <TestEmailButton />
          <LogoutButton />
        </div>
      </header>

      <main className="container animate-fade-in" style={{ padding: '2rem 1.5rem', maxWidth: '800px' }}>
        <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Resumo do Dia</h1>
        
        <TaskForm />

        <TaskList tasks={tasks} />
      </main>
    </div>
  )
}
