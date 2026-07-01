import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'

export async function GET(request: Request) {
  // Proteção do Cron Job (Vercel)
  const authHeader = request.headers.get('authorization')
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.error("Faltam credenciais de e-mail no .env")
    return NextResponse.json({ error: 'Configuração de e-mail ausente' }, { status: 500 })
  }

  try {
    const now = new Date()

    // Busca todas as tarefas não concluídas que possuem data de vencimento e lembrete não enviado
    const tasks = await prisma.task.findMany({
      where: {
        isCompleted: false,
        reminderSent: false,
        reminderMinutes: { not: null },
        dueDate: { not: null }
      },
      include: {
        user: true
      }
    })

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    })

    let remindersSent = 0

    for (const task of tasks) {
      if (!task.dueDate || task.reminderMinutes === null || !task.user.email) continue;

      const dueDate = new Date(task.dueDate)
      // Momento exato em que o lembrete deve disparar
      const reminderTime = new Date(dueDate.getTime() - task.reminderMinutes * 60 * 1000)

      // Se a hora atual já passou do momento do lembrete, e a tarefa não está atrasada há mais de 12 horas
      const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000)

      if (now >= reminderTime && dueDate >= twelveHoursAgo) {
        // Envia o e-mail
        const formattedDate = dueDate.toLocaleString('pt-BR', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        })

        const mailOptions = {
          from: `"Lembrete de Agenda" <${process.env.EMAIL_USER}>`,
          to: task.user.email,
          subject: `⏰ Lembrete: ${task.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; color: #1a1d24; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; padding: 20px;">
              <h2 style="color: #6366f1; display: flex; align-items: center; gap: 10px;">
                ⏰ Lembrete de Tarefa
              </h2>
              <p style="font-size: 16px;">Sua tarefa está se aproximando do horário agendado!</p>
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #f3f4f6; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #111827;">${task.title}</h3>
                <p style="margin: 5px 0; font-size: 14px;"><strong>Categoria:</strong> ${task.category === 'PROFESSIONAL' ? 'Profissional' : task.category === 'ACADEMIC' ? 'Acadêmica' : 'Pessoal'}</p>
                <p style="margin: 5px 0; font-size: 14px;"><strong>Data e Hora:</strong> 🕒 ${formattedDate}</p>
              </div>
              <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
              <p style="font-size: 14px; color: #6b7280;">Acesse sua Agenda Pessoal para marcar como concluída ou reagendar.</p>
            </div>
          `,
        }

        await transporter.sendMail(mailOptions)

        // Atualiza no banco para evitar reenvio
        await prisma.task.update({
          where: { id: task.id },
          data: { reminderSent: true }
        })

        remindersSent++
      }
    }

    return NextResponse.json({ success: true, remindersSent })
  } catch (error) {
    console.error("Erro no processamento de lembretes:", error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
