"use server"

import { createClient } from "@/lib/supabase/server"

export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return false
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  return profile?.role === "admin"
}

export async function getAdminStats() {
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

  if (profile?.role !== "admin") {
    return { error: "Admin access required" }
  }

  // Get stats
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  const { count: totalProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })

  const { count: activeProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)

  return {
    totalUsers: totalUsers || 0,
    totalProducts: totalProducts || 0,
    activeProducts: activeProducts || 0,
  }
}
