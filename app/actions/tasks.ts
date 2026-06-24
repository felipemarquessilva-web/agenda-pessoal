'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

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

  if (!title || !category) return

  let dueDate = null;
  if (dueDateStr) {
    dueDate = new Date(dueDateStr) 
  }

  await prisma.task.create({
    data: {
      title,
      category,
      dueDate,
      userId: (session.user as any).id
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
