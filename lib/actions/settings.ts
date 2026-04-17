"use server"

import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/actions/admin"
import { revalidatePath } from "next/cache"

const SETTINGS_ID = "00000000-0000-0000-0000-000000000001"

export type AdvisorSettings = {
  id: string
  display_name: string
  role_title: string
  bio: string | null
  photo_url: string | null
  whatsapp: string
  email: string | null
  location: string | null
  stat_clients: string | null
  stat_experience: string | null
  stat_products: string | null
  whatsapp_message: string | null
  office_hours: string | null
  updated_at: string
}

// ─── Public read ─────────────────────────────────────────────────────────────

export async function getAdvisorSettings(): Promise<AdvisorSettings | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("advisor_settings")
    .select("*")
    .eq("id", SETTINGS_ID)
    .single()
  return data as AdvisorSettings | null
}

// ─── Admin update ─────────────────────────────────────────────────────────────

export async function updateAdvisorSettings(
  input: Partial<Omit<AdvisorSettings, "id" | "updated_at">>
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdmin())) return { success: false, error: "Admin required" }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from("advisor_settings")
    .update({ ...input, updated_at: new Date().toISOString(), updated_by: user?.id })
    .eq("id", SETTINGS_ID)

  if (error) return { success: false, error: error.message }

  revalidatePath("/")
  revalidatePath("/contacto")
  return { success: true }
}

// ─── Upload profile photo ─────────────────────────────────────────────────────

export async function uploadAdvisorPhoto(
  formData: FormData
): Promise<{ url: string | null; error: string | null }> {
  if (!(await isAdmin())) return { url: null, error: "Admin required" }

  const supabase = await createClient()

  const file = formData.get("file") as File
  if (!file) return { url: null, error: "No file provided" }

  const allowed = ["image/jpeg", "image/png", "image/webp"]
  if (!allowed.includes(file.type)) return { url: null, error: "Formato inválido. Usá JPEG, PNG o WebP." }
  if (file.size > 5 * 1024 * 1024) return { url: null, error: "Máximo 5MB." }

  const ext = file.name.split(".").pop()
  const path = `profile/${Date.now()}.${ext}`

  // Remove old photo first (ignore errors)
  const { data: existing } = await supabase
    .from("advisor_settings")
    .select("photo_url")
    .eq("id", SETTINGS_ID)
    .single()

  if (existing?.photo_url) {
    const oldPath = existing.photo_url.split("/advisor-assets/")[1]
    if (oldPath) await supabase.storage.from("advisor-assets").remove([oldPath])
  }

  const { data, error: uploadError } = await supabase.storage
    .from("advisor-assets")
    .upload(path, file, { cacheControl: "3600", upsert: true })

  if (uploadError) return { url: null, error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage
    .from("advisor-assets")
    .getPublicUrl(data.path)

  // Persist URL in settings
  await updateAdvisorSettings({ photo_url: publicUrl })

  return { url: publicUrl, error: null }
}
