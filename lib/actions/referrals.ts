"use server"

import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/actions/admin"
import { randomBytes } from "crypto"

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type ReferralCode = {
  id: string
  code: string
  created_by: string
  assigned_to: string | null
  used_by: string | null
  used_at: string | null
  is_active: boolean
  notes: string | null
  created_at: string
  assigned_profile?: { display_name: string | null; email: string } | null
  used_profile?: { display_name: string | null; email: string } | null
}

export type TreeNode = {
  id: string
  display_name: string | null
  email: string
  referred_by: string | null
  depth: number
  created_at: string
  children: TreeNode[]
}

// ─────────────────────────────────────────────
// Validate a referral code (public — called before sign-up)
// ─────────────────────────────────────────────

export async function validateReferralCode(
  code: string
): Promise<{ valid: boolean; assignedTo: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("referral_codes")
    .select("id, assigned_to")
    .eq("code", code.toUpperCase().trim())
    .eq("is_active", true)
    .is("used_by", null)
    .maybeSingle()

  if (error || !data) return { valid: false, assignedTo: null }
  return { valid: true, assignedTo: data.assigned_to }
}

// ─────────────────────────────────────────────
// Consume code after sign-up (links referred_by on the profile)
// ─────────────────────────────────────────────

export async function consumeReferralCode(
  code: string,
  newUserId: string
): Promise<{ success: boolean; inviterId: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc("consume_referral_code", {
    p_code: code.toUpperCase().trim(),
    p_new_user_id: newUserId,
  })

  if (error) {
    console.error("consume_referral_code error:", error)
    return { success: false, inviterId: null }
  }

  return { success: true, inviterId: data as string | null }
}

// ─────────────────────────────────────────────
// Get the current user's tree:
//   - upline (who invited them, up the chain)
//   - their own profile (root)
//   - downline (recursive descendants)
// ─────────────────────────────────────────────

export async function getMyTree(): Promise<{
  upline: { id: string; display_name: string | null; email: string }[]
  me: { id: string; display_name: string | null; email: string; referred_by: string | null }
  downlineFlat: { id: string; display_name: string | null; email: string; referred_by: string | null; depth: number; created_at: string }[]
  error?: string
}> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { upline: [], me: { id: "", display_name: null, email: "" , referred_by: null }, downlineFlat: [], error: "Unauthorized" }

  // My own profile
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("id, display_name, email, referred_by")
    .eq("id", user.id)
    .single()

  if (!myProfile) return { upline: [], me: { id: "", display_name: null, email: "", referred_by: null }, downlineFlat: [], error: "Profile not found" }

  // Build upline chain (walk referred_by up)
  const upline: { id: string; display_name: string | null; email: string }[] = []
  let currentReferredBy = myProfile.referred_by

  while (currentReferredBy) {
    const { data: parentProfile } = await supabase
      .from("profiles")
      .select("id, display_name, email, referred_by")
      .eq("id", currentReferredBy)
      .single()

    if (!parentProfile) break
    upline.unshift({ id: parentProfile.id, display_name: parentProfile.display_name, email: parentProfile.email })
    currentReferredBy = parentProfile.referred_by
  }

  // Get full downline via recursive SQL function
  const { data: downlineFlat, error: downlineError } = await supabase
    .rpc("get_downline", { root_id: user.id })

  if (downlineError) {
    console.error("get_downline error:", downlineError)
  }

  return {
    upline,
    me: {
      id: myProfile.id,
      display_name: myProfile.display_name,
      email: myProfile.email,
      referred_by: myProfile.referred_by,
    },
    downlineFlat: (downlineFlat ?? []) as any[],
  }
}

// ─────────────────────────────────────────────
// Admin: list all referral codes
// ─────────────────────────────────────────────

export async function listReferralCodes(): Promise<{ data: ReferralCode[]; error?: string }> {
  if (!(await isAdmin())) return { data: [], error: "Admin required" }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("referral_codes")
    .select(`
      *,
      assigned_profile:profiles!referral_codes_assigned_to_fkey(display_name, email),
      used_profile:profiles!referral_codes_used_by_fkey(display_name, email)
    `)
    .order("created_at", { ascending: false })

  if (error) return { data: [], error: error.message }
  return { data: data as ReferralCode[] }
}

// ─────────────────────────────────────────────
// Admin: create a new referral code
// ─────────────────────────────────────────────

export async function createReferralCode(opts: {
  assignedTo?: string | null
  notes?: string
}): Promise<{ data: ReferralCode | null; error?: string }> {
  if (!(await isAdmin())) return { data: null, error: "Admin required" }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: "Unauthorized" }

  // Generate a readable 8-char code like "TERA-X3K9"
  const raw = randomBytes(3).toString("hex").toUpperCase()
  const code = `TERA-${raw}`

  const { data, error } = await supabase
    .from("referral_codes")
    .insert({
      code,
      created_by: user.id,
      assigned_to: opts.assignedTo ?? null,
      notes: opts.notes ?? null,
    })
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as ReferralCode }
}

// ─────────────────────────────────────────────
// Admin: deactivate a code
// ─────────────────────────────────────────────

export async function deactivateReferralCode(
  codeId: string
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdmin())) return { success: false, error: "Admin required" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("referral_codes")
    .update({ is_active: false })
    .eq("id", codeId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

// ─────────────────────────────────────────────
// Admin: list all members with tree info
// ─────────────────────────────────────────────

export async function listAllMembers(): Promise<{
  data: { id: string; display_name: string | null; email: string; referred_by: string | null; role: string; created_at: string }[]
  error?: string
}> {
  if (!(await isAdmin())) return { data: [], error: "Admin required" }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, email, referred_by, role, created_at")
    .order("created_at", { ascending: true })

  if (error) return { data: [], error: error.message }
  return { data: data ?? [] }
}
