"use server"

import { createClient } from "@/lib/supabase/server"

export async function updateProfile(userId: string, fullName: string) {
  const supabase = await createClient()

  // Verify user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    return { error: "Unauthorized" }
  }

  // Update profile
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: fullName })
    .eq("id", userId)

  if (error) {
    console.error("Error updating profile:", error)
    return { error: "Failed to update profile" }
  }

  return { success: true }
}
