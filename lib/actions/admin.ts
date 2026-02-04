"use server"

import { createClient } from "@/lib/supabase/server"

interface AddRewardInput {
  name: string
  description: string | null
  points_cost: number
  stock: number | null
}

export async function addReward(input: AddRewardInput) {
  const supabase = await createClient()

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: "Admin access required" }
  }

  // Add reward
  const { error } = await supabase.from("rewards_catalog").insert({
    name: input.name,
    description: input.description,
    points_cost: input.points_cost,
    stock: input.stock,
    is_active: true,
  })

  if (error) {
    console.error("Error adding reward:", error)
    return { error: "Failed to add reward" }
  }

  return { success: true }
}

export async function toggleRewardStatus(rewardId: string, isActive: boolean) {
  const supabase = await createClient()

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: "Admin access required" }
  }

  // Update reward status
  const { error } = await supabase
    .from("rewards_catalog")
    .update({ is_active: isActive })
    .eq("id", rewardId)

  if (error) {
    console.error("Error updating reward:", error)
    return { error: "Failed to update reward" }
  }

  return { success: true }
}

export async function updateUserPoints(userId: string, points: number) {
  const supabase = await createClient()

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: "Admin access required" }
  }

  // Update user points
  const { error } = await supabase
    .from("profiles")
    .update({ points_balance: points })
    .eq("id", userId)

  if (error) {
    console.error("Error updating points:", error)
    return { error: "Failed to update points" }
  }

  return { success: true }
}
