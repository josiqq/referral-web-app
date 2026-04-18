"use server"

import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/actions/admin"
import { revalidatePath } from "next/cache"
import { updateAdvisorSettings } from "@/lib/actions/settings"

export type Sponsor = {
  id: string
  name: string
  logo_url: string | null
  website_url: string | null
  description: string | null
  position: number
  is_active: boolean
  created_at: string
}

// ─── Public read ──────────────────────────────────────────────────────────────

export async function getSponsors(onlyActive = true): Promise<Sponsor[]> {
  const supabase = await createClient()
  let query = supabase
    .from("sponsors")
    .select("*")
    .order("position", { ascending: true })

  if (onlyActive) query = query.eq("is_active", true)

  const { data } = await query
  return (data ?? []) as Sponsor[]
}

// ─── Admin CRUD ───────────────────────────────────────────────────────────────

export async function createSponsor(
  input: Pick<Sponsor, "name" | "logo_url" | "website_url" | "description">
): Promise<{ data: Sponsor | null; error?: string }> {
  if (!(await isAdmin())) return { data: null, error: "Admin required" }

  const supabase = await createClient()
  const { data: last } = await supabase
    .from("sponsors")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .single()

  const position = (last?.position ?? -1) + 1

  const { data, error } = await supabase
    .from("sponsors")
    .insert({ ...input, position })
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  revalidatePath("/")
  return { data: data as Sponsor }
}

export async function updateSponsor(
  id: string,
  input: Partial<Pick<Sponsor, "name" | "logo_url" | "website_url" | "description" | "is_active" | "position">>
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdmin())) return { success: false, error: "Admin required" }

  const supabase = await createClient()
  const { error } = await supabase.from("sponsors").update(input).eq("id", id)

  if (error) return { success: false, error: error.message }
  revalidatePath("/")
  return { success: true }
}

export async function deleteSponsor(id: string): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdmin())) return { success: false, error: "Admin required" }

  const supabase = await createClient()

  // Borrar logo del storage si existe
  const { data: sponsor } = await supabase
    .from("sponsors")
    .select("logo_url")
    .eq("id", id)
    .single()

  if (sponsor?.logo_url) {
    const path = sponsor.logo_url.split("/advisor-assets/")[1]
    if (path) await supabase.storage.from("advisor-assets").remove([path])
  }

  const { error } = await supabase.from("sponsors").delete().eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/")
  return { success: true }
}

export async function reorderSponsors(
  ids: string[]
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdmin())) return { success: false, error: "Admin required" }

  const supabase = await createClient()
  const updates = ids.map((id, i) =>
    supabase.from("sponsors").update({ position: i }).eq("id", id)
  )
  await Promise.all(updates)
  revalidatePath("/")
  return { success: true }
}

// ─── Toggle sección ───────────────────────────────────────────────────────────

export async function toggleSponsorsSection(
  enabled: boolean
): Promise<{ success: boolean; error?: string }> {
  return updateAdvisorSettings({ sponsors_enabled: enabled } as Parameters<typeof updateAdvisorSettings>[0])
}

// ─── Upload logo ──────────────────────────────────────────────────────────────

export async function uploadSponsorLogo(
  formData: FormData
): Promise<{ url: string | null; error: string | null }> {
  if (!(await isAdmin())) return { url: null, error: "Admin required" }

  const supabase = await createClient()
  const file = formData.get("file") as File
  if (!file) return { url: null, error: "No file provided" }

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"]
  if (!allowed.includes(file.type)) return { url: null, error: "Formato inválido. Usá JPEG, PNG, WebP o SVG." }
  if (file.size > 2 * 1024 * 1024) return { url: null, error: "Máximo 2MB." }

  const ext = file.name.split(".").pop()
  const path = `sponsors/${Date.now()}.${ext}`

  const { data, error: uploadError } = await supabase.storage
    .from("advisor-assets")
    .upload(path, file, { cacheControl: "3600", upsert: true })

  if (uploadError) return { url: null, error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage
    .from("advisor-assets")
    .getPublicUrl(data.path)

  return { url: publicUrl, error: null }
}
