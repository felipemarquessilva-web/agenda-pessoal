'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import nodemailer from 'nodemailer'

export async function getTasks() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !(session.user as any).id) {
    return []
  }

  return await prisma.task.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { createdAt: 'desc' }
  })
}

export async function createTask(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !(session.user as any).id) {
    throw new Error("Não autorizado")
  }

  const title = formData.get('title') as string
  const category = formData.get('category') as string
  const dueDateStr = formData.get('dueDate') as string
  const reminderMinutesStr = formData.get('reminderMinutes') as string

  if (!title || !category) return

  let dueDate = null;
  if (dueDateStr) {
    dueDate = new Date(dueDateStr) 
  }

  let reminderMinutes = null;
  if (reminderMinutesStr && reminderMinutesStr !== 'NONE') {
    reminderMinutes = parseInt(reminderMinutesStr, 10)
  }

  await prisma.task.create({
    data: {
      title,
      category,
      dueDate,
      reminderMinutes,
      userId: (session.user as any).id
    }
  })

  revalidatePath('/')
}

export async function updateTask(id: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Não autorizado")

  const title = formData.get('title') as string
  const category = formData.get('category') as string
  const dueDateStr = formData.get('dueDate') as string
  const reminderMinutesStr = formData.get('reminderMinutes') as string

  if (!title || !category) return

  let dueDate = null;
  if (dueDateStr) {
    dueDate = new Date(dueDateStr) 
  }

  let reminderMinutes = null;
  if (reminderMinutesStr && reminderMinutesStr !== 'NONE') {
    reminderMinutes = parseInt(reminderMinutesStr, 10)
  }

  await prisma.task.update({
    where: { id },
    data: {
      title,
      category,
      dueDate,
      reminderMinutes,
      reminderSent: false // Redefine o status do lembrete se a tarefa for editada
    }
  })

  revalidatePath('/')
}

export async function toggleTask(id: string, isCompleted: boolean) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Não autorizado")

  await prisma.task.update({
    where: { id },
    data: { isCompleted: !isCompleted }
  })

  revalidatePath('/')
}

export async function deleteTask(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Não autorizado")

  await prisma.task.delete({
    where: { id }
  })

  revalidatePath('/')
}

export async function sendTestEmail() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !session.user.email) {
    return { success: false, error: "Não autorizado ou e-mail de usuário ausente" }
  }

  const userId = (session.user as any).id
  const userEmail = session.user.email
  const userName = session.user.name || 'Usuário VIP'

  const tasks = await prisma.task.findMany({
    where: { userId, isCompleted: false },
    orderBy: { dueDate: 'asc' }
  })

  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    return { success: false, error: "Faltam credenciais de e-mail no servidor (env)" }
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    })

    const taskListHtml = tasks.length > 0 
      ? tasks.map(t => `
          <li style="margin-bottom: 8px;">
            <strong>${t.title}</strong> 
            <span style="font-size: 0.8em; color: #666;">(${t.category})</span>
            ${t.dueDate ? ` - 🕒 ${new Date(t.dueDate).toLocaleString('pt-BR')}` : ''}
          </li>`).join('')
      : '<p>Nenhuma tarefa pendente!</p>'

    const mailOptions = {
      from: `"Teste de Agenda" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '🧪 Teste de E-mail: Suas tarefas pendentes',
      html: `
        <div style="font-family: Arial, sans-serif; color: #1a1d24; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; padding: 20px;">
          <h2 style="color: #6366f1;">Olá, ${userName}!</h2>
          <p style="font-size: 16px;">Este é um e-mail de teste para validar o funcionamento do seu aplicativo de Agenda Pessoal.</p>
          <p style="font-size: 16px;"><strong>Suas tarefas pendentes atuais:</strong></p>
          <ul style="font-size: 16px; padding-left: 20px;">
            ${taskListHtml}
          </ul>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <p style="font-size: 14px; color: #6b7280;">Se você recebeu esta mensagem, significa que seu envio de e-mails está 100% funcionando!</p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error: any) {
    console.error("Erro no teste de e-mail:", error)
    return { success: false, error: error.message || "Erro ao disparar e-mail" }
  }
}
