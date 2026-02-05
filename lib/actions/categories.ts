"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface ProductCategory {
  id: string
  slug: string
  name: string
  description: string | null
  image_url: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function getCategories(): Promise<{ data: ProductCategory[] | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("product_categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Error fetching categories:", error)
    return { data: null, error: "Failed to fetch categories" }
  }

  return { data: data as ProductCategory[], error: null }
}

export async function getCategoryBySlug(slug: string): Promise<{ data: ProductCategory | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("product_categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error) {
    console.error("Error fetching category:", error)
    return { data: null, error: "Category not found" }
  }

  return { data: data as ProductCategory, error: null }
}

export async function getAllCategories(): Promise<{ data: ProductCategory[] | null; error: string | null }> {
  const supabase = await createClient()

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: "Unauthorized" }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return { data: null, error: "Admin access required" }
  }

  const { data, error } = await supabase
    .from("product_categories")
    .select("*")
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Error fetching categories:", error)
    return { data: null, error: "Failed to fetch categories" }
  }

  return { data: data as ProductCategory[], error: null }
}

interface CreateCategoryInput {
  slug: string
  name: string
  description?: string
  image_url?: string
  is_active?: boolean
  display_order?: number
}

export async function createCategory(input: CreateCategoryInput): Promise<{ data: ProductCategory | null; error: string | null }> {
  const supabase = await createClient()

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: "Unauthorized" }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return { data: null, error: "Admin access required" }
  }

  const { data, error } = await supabase
    .from("product_categories")
    .insert({
      slug: input.slug,
      name: input.name,
      description: input.description || null,
      image_url: input.image_url || null,
      is_active: input.is_active ?? true,
      display_order: input.display_order || 0,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating category:", error)
    return { data: null, error: "Failed to create category" }
  }

  revalidatePath("/")
  return { data: data as ProductCategory, error: null }
}

interface UpdateCategoryInput {
  id: string
  slug?: string
  name?: string
  description?: string
  image_url?: string
  is_active?: boolean
  display_order?: number
}

export async function updateCategory(input: UpdateCategoryInput): Promise<{ data: ProductCategory | null; error: string | null }> {
  const supabase = await createClient()

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: "Unauthorized" }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return { data: null, error: "Admin access required" }
  }

  const { id, ...updateData } = input

  const { data, error } = await supabase
    .from("product_categories")
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating category:", error)
    return { data: null, error: "Failed to update category" }
  }

  revalidatePath("/")
  return { data: data as ProductCategory, error: null }
}

export async function deleteCategory(id: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return { success: false, error: "Admin access required" }
  }

  const { error } = await supabase
    .from("product_categories")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting category:", error)
    return { success: false, error: "Failed to delete category" }
  }

  revalidatePath("/")
  return { success: true, error: null }
}
