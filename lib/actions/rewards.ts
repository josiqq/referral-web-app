"use server"

import { createClient } from "@/lib/supabase/server"

export async function redeemReward(userId: string, rewardId: string) {
  const supabase = await createClient()

  // Verify user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    return { error: "Unauthorized" }
  }

  // Get reward details
  const { data: reward } = await supabase
    .from("rewards_catalog")
    .select("*")
    .eq("id", rewardId)
    .single()

  if (!reward) {
    return { error: "Reward not found" }
  }

  if (!reward.is_active) {
    return { error: "This reward is no longer available" }
  }

  if (reward.stock !== null && reward.stock <= 0) {
    return { error: "This reward is out of stock" }
  }

  // Get user's current points
  const { data: profile } = await supabase
    .from("profiles")
    .select("points_balance")
    .eq("id", userId)
    .single()

  if (!profile) {
    return { error: "User profile not found" }
  }

  if (profile.points_balance < reward.points_cost) {
    return { error: "Insufficient points" }
  }

  // Deduct points from user
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ points_balance: profile.points_balance - reward.points_cost })
    .eq("id", userId)

  if (updateError) {
    console.error("Error updating points:", updateError)
    return { error: "Failed to redeem reward" }
  }

  // Create ledger entry
  const { error: ledgerError } = await supabase.from("reward_ledger").insert({
    user_id: userId,
    type: "reward_redemption",
    points: -reward.points_cost,
    description: `Redeemed: ${reward.name}`,
    reference_id: rewardId,
  })

  if (ledgerError) {
    console.error("Error creating ledger entry:", ledgerError)
    // Rollback points
    await supabase
      .from("profiles")
      .update({ points_balance: profile.points_balance })
      .eq("id", userId)
    return { error: "Failed to redeem reward" }
  }

  // Update reward stock if applicable
  if (reward.stock !== null) {
    await supabase
      .from("rewards_catalog")
      .update({ stock: reward.stock - 1 })
      .eq("id", rewardId)
  }

  return { success: true }
}
