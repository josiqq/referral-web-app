"use server"

import { createClient } from "@/lib/supabase/server"

export async function sendInvitation(
  userId: string,
  email: string,
  message?: string
) {
  const supabase = await createClient()

  // Check if user exists
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    return { error: "Unauthorized" }
  }

  // Check if this email has already been invited by this user
  const { data: existingInvitation } = await supabase
    .from("invitations")
    .select("id")
    .eq("sender_id", userId)
    .eq("email", email.toLowerCase())
    .single()

  if (existingInvitation) {
    return { error: "You have already invited this email address" }
  }

  // Check if email is already a registered user
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", (await supabase.auth.admin.listUsers({ filter: `email.eq.${email}` })).data?.users?.[0]?.id || "")
    .single()

  if (existingProfile) {
    return { error: "This email is already registered" }
  }

  // Get the inviter's referral code
  const { data: profile } = await supabase
    .from("profiles")
    .select("referral_code")
    .eq("id", userId)
    .single()

  if (!profile?.referral_code) {
    return { error: "Unable to find your referral code" }
  }

  // Create the invitation
  const { error } = await supabase.from("invitations").insert({
    sender_id: userId,
    email: email.toLowerCase(),
    status: "pending",
  })

  if (error) {
    console.error("Error creating invitation:", error)
    return { error: "Failed to send invitation" }
  }

  // In a real app, you would send an email here using a service like Resend, SendGrid, etc.
  // For now, we just create the invitation record

  return { success: true }
}
