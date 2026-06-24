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

  try {
    const users = await prisma.user.findMany({
      include: {
        tasks: {
          where: { isCompleted: false },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.error("Faltam credenciais de e-mail no .env")
      return NextResponse.json({ error: 'Configuração de e-mail ausente' }, { status: 500 })
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    })

    let emailsSent = 0

    for (const user of users) {
      if (!user.email || user.tasks.length === 0) continue;

      const taskListHtml = user.tasks.map(t => `<li style="margin-bottom: 8px;"><strong>${t.title}</strong> <span style="font-size: 0.8em; color: #666;">(${t.category})</span></li>`).join('')

      const mailOptions = {
        from: `"Sua Agenda" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: '📝 Suas tarefas pendentes para hoje',
        html: `
          <div style="font-family: Arial, sans-serif; color: #1a1d24; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; padding: 20px;">
            <h2 style="color: #6366f1;">Olá, ${user.name || 'Usuário'}!</h2>
            <p style="font-size: 16px;">Aqui está o resumo das suas tarefas que ainda precisam de atenção:</p>
            <ul style="font-size: 16px; padding-left: 20px;">
              ${taskListHtml}
            </ul>
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
            <p style="font-size: 14px; color: #6b7280;">Mantenha o foco! Acesse sua Agenda para atualizar o status.</p>
          </div>
        `,
      }

      await transporter.sendMail(mailOptions)
      emailsSent++
    }

    return NextResponse.json({ success: true, emailsSent })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
