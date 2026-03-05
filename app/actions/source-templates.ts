"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createSourceTemplate(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const name = formData.get("name") as string
  const baseTemplate = formData.get("baseTemplate") as string
  const isDefault = formData.get("isDefault") === "true"

  // If setting as default, unset other defaults
  if (isDefault) {
    await prisma.sourceTemplate.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    })
  }

  const template = await prisma.sourceTemplate.create({
    data: {
      userId: user.id,
      name,
      baseTemplate,
      isDefault,
    },
  })

  revalidatePath("/settings/sources")
  return template
}

export async function updateSourceTemplate(templateId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Verify ownership
  const template = await prisma.sourceTemplate.findFirst({
    where: { id: templateId, userId: user.id },
  })

  if (!template) {
    throw new Error("Template not found")
  }

  const name = formData.get("name") as string
  const baseTemplate = formData.get("baseTemplate") as string
  const isDefault = formData.get("isDefault") === "true"

  // If setting as default, unset other defaults
  if (isDefault) {
    await prisma.sourceTemplate.updateMany({
      where: { userId: user.id, isDefault: true, id: { not: templateId } },
      data: { isDefault: false },
    })
  }

  const updated = await prisma.sourceTemplate.update({
    where: { id: templateId },
    data: {
      name,
      baseTemplate,
      isDefault,
    },
  })

  revalidatePath("/settings/sources")
  return updated
}

export async function deleteSourceTemplate(templateId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Verify ownership
  const template = await prisma.sourceTemplate.findFirst({
    where: { id: templateId, userId: user.id },
  })

  if (!template) {
    throw new Error("Template not found")
  }

  await prisma.sourceTemplate.delete({
    where: { id: templateId },
  })

  revalidatePath("/settings/sources")
}

export async function setDefaultTemplate(templateId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Verify ownership
  const template = await prisma.sourceTemplate.findFirst({
    where: { id: templateId, userId: user.id },
  })

  if (!template) {
    throw new Error("Template not found")
  }

  // Unset all other defaults
  await prisma.sourceTemplate.updateMany({
    where: { userId: user.id, isDefault: true },
    data: { isDefault: false },
  })

  // Set this one as default
  await prisma.sourceTemplate.update({
    where: { id: templateId },
    data: { isDefault: true },
  })

  revalidatePath("/settings/sources")
}
