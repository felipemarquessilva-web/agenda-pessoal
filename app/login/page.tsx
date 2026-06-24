import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import LoginForm from "./LoginForm"

export default async function LoginPage() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect("/")
  }

  return (
    <div className="main-content" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="container animate-fade-in" style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          padding: '2.5rem',
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Agenda Pessoal</h1>
          <p className="text-muted" style={{ marginBottom: '2rem' }}>
            Faça login para acessar suas tarefas.
          </p>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
