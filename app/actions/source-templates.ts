"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import {
  validateFormData,
  createSourceTemplateSchema,
  updateSourceTemplateSchema,
  sanitizeError,
} from "@/lib/validations"

export async function createSourceTemplate(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    // Validate input
    const validation = validateFormData(formData, createSourceTemplateSchema)
    if (!validation.success) {
      throw new Error(validation.error)
    }

    const { name, baseTemplate, isDefault } = validation.data

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
        isDefault: isDefault || false,
      },
    })

    revalidatePath("/settings/sources")
    return template
  } catch (error) {
    throw new Error(sanitizeError(error))
  }
}

export async function updateSourceTemplate(templateId: string, formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    // Validate input
    const validation = validateFormData(formData, updateSourceTemplateSchema)
    if (!validation.success) {
      throw new Error(validation.error)
    }

    // Verify ownership
    const template = await prisma.sourceTemplate.findFirst({
      where: { id: templateId, userId: user.id },
    })

    if (!template) {
      throw new Error("Template not found")
    }

    const { name, baseTemplate, isDefault } = validation.data

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
        isDefault: isDefault || false,
      },
    })

    revalidatePath("/settings/sources")
    return updated
  } catch (error) {
    throw new Error(sanitizeError(error))
  }
}

export async function deleteSourceTemplate(templateId: string) {
  try {
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
  } catch (error) {
    throw new Error(sanitizeError(error))
  }
}

export async function setDefaultTemplate(templateId: string) {
  try {
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
  } catch (error) {
    throw new Error(sanitizeError(error))
  }
}
