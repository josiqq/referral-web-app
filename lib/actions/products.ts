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

export interface Product {
  id: string
  slug: string
  name: string
  short_description: string | null
  description: string | null
  benefits: string[]
  ingredients: string | null
  usage_instructions: string | null
  price: number | null
  is_active: boolean
  display_order: number
  category_id: string | null
  created_at: string
  updated_at: string
  images?: ProductImage[]
  category?: ProductCategory | null
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  alt_text: string | null
  is_primary: boolean
  display_order: number
  created_at: string
}

export async function getProducts(): Promise<{ data: Product[] | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      images:product_images(*),
      category:product_categories(*)
    `)
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Error fetching products:", error)
    return { data: null, error: "Failed to fetch products" }
  }

  return { data: data as Product[], error: null }
}

export async function getProductsByCategory(categoryId: string): Promise<{ data: Product[] | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      images:product_images(*),
      category:product_categories(*)
    `)
    .eq("is_active", true)
    .eq("category_id", categoryId)
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Error fetching products by category:", error)
    return { data: null, error: "Failed to fetch products" }
  }

  return { data: data as Product[], error: null }
}

export async function getProductsGroupedByCategory(): Promise<{
  data: { category: ProductCategory | null; products: Product[] }[] | null;
  error: string | null
}> {
  const supabase = await createClient()

  // Get all active categories
  const { data: categories, error: catError } = await supabase
    .from("product_categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  if (catError) {
    console.error("Error fetching categories:", catError)
    return { data: null, error: "Failed to fetch categories" }
  }

  // Get all active products with their categories
  const { data: products, error: prodError } = await supabase
    .from("products")
    .select(`
      *,
      images:product_images(*),
      category:product_categories(*)
    `)
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  if (prodError) {
    console.error("Error fetching products:", prodError)
    return { data: null, error: "Failed to fetch products" }
  }

  const typedProducts = products as Product[]
  const typedCategories = categories as ProductCategory[]

  // Group products by category
  const grouped: { category: ProductCategory | null; products: Product[] }[] = []

  // Add products for each category
  for (const category of typedCategories) {
    const categoryProducts = typedProducts.filter(p => p.category_id === category.id)
    if (categoryProducts.length > 0) {
      grouped.push({ category, products: categoryProducts })
    }
  }

  // Add products without category at the end
  const uncategorizedProducts = typedProducts.filter(p => !p.category_id)
  if (uncategorizedProducts.length > 0) {
    grouped.push({ category: null, products: uncategorizedProducts })
  }

  return { data: grouped, error: null }
}

export async function getProductBySlug(slug: string): Promise<{ data: Product | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      images:product_images(*)
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error) {
    console.error("Error fetching product:", error)
    return { data: null, error: "Product not found" }
  }

  return { data: data as Product, error: null }
}

export async function getAllProducts(): Promise<{ data: Product[] | null; error: string | null }> {
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
    .from("products")
    .select(`
      *,
      images:product_images(*),
      category:product_categories(*)
    `)
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Error fetching products:", error)
    return { data: null, error: "Failed to fetch products" }
  }

  return { data: data as Product[], error: null }
}

interface CreateProductInput {
  slug: string
  name: string
  short_description?: string
  description?: string
  benefits?: string[]
  ingredients?: string
  usage_instructions?: string
  price?: number
  is_active?: boolean
  display_order?: number
  category_id?: string
}

export async function createProduct(input: CreateProductInput): Promise<{ data: Product | null; error: string | null }> {
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
    .from("products")
    .insert({
      slug: input.slug,
      name: input.name,
      short_description: input.short_description || null,
      description: input.description || null,
      benefits: input.benefits || [],
      ingredients: input.ingredients || null,
      usage_instructions: input.usage_instructions || null,
      price: input.price || null,
      is_active: input.is_active ?? true,
      display_order: input.display_order || 0,
      category_id: input.category_id || null,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating product:", error)
    return { data: null, error: "Failed to create product" }
  }

  revalidatePath("/")
  return { data: data as Product, error: null }
}

interface UpdateProductInput {
  id: string
  slug?: string
  name?: string
  short_description?: string
  description?: string
  benefits?: string[]
  ingredients?: string
  usage_instructions?: string
  price?: number
  is_active?: boolean
  display_order?: number
  category_id?: string | null
}

export async function updateProduct(input: UpdateProductInput): Promise<{ data: Product | null; error: string | null }> {
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
    .from("products")
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating product:", error)
    return { data: null, error: "Failed to update product" }
  }

  revalidatePath("/")
  return { data: data as Product, error: null }
}

export async function deleteProduct(id: string): Promise<{ success: boolean; error: string | null }> {
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
    .from("products")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting product:", error)
    return { success: false, error: "Failed to delete product" }
  }

  revalidatePath("/")
  return { success: true, error: null }
}

// Product Images

export async function addProductImage(
  productId: string,
  imageUrl: string,
  altText?: string,
  isPrimary?: boolean
): Promise<{ data: ProductImage | null; error: string | null }> {
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

  // If this image is primary, unset other primary images
  if (isPrimary) {
    await supabase
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", productId)
  }

  // Get max display order
  const { data: existingImages } = await supabase
    .from("product_images")
    .select("display_order")
    .eq("product_id", productId)
    .order("display_order", { ascending: false })
    .limit(1)

  const maxOrder = existingImages?.[0]?.display_order ?? -1

  const { data, error } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      image_url: imageUrl,
      alt_text: altText || null,
      is_primary: isPrimary ?? false,
      display_order: maxOrder + 1,
    })
    .select()
    .single()

  if (error) {
    console.error("Error adding image:", error)
    return { data: null, error: "Failed to add image" }
  }

  revalidatePath("/")
  return { data: data as ProductImage, error: null }
}

export async function deleteProductImage(id: string): Promise<{ success: boolean; error: string | null }> {
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
    .from("product_images")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting image:", error)
    return { success: false, error: "Failed to delete image" }
  }

  revalidatePath("/")
  return { success: true, error: null }
}

export async function updateProductImageOrder(
  images: { id: string; display_order: number }[]
): Promise<{ success: boolean; error: string | null }> {
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

  for (const image of images) {
    const { error } = await supabase
      .from("product_images")
      .update({ display_order: image.display_order })
      .eq("id", image.id)

    if (error) {
      console.error("Error updating image order:", error)
      return { success: false, error: "Failed to update image order" }
    }
  }

  revalidatePath("/")
  return { success: true, error: null }
}

export async function setPrimaryImage(
  productId: string,
  imageId: string
): Promise<{ success: boolean; error: string | null }> {
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

  // Unset all primary images for this product
  await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId)

  // Set the new primary image
  const { error } = await supabase
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", imageId)

  if (error) {
    console.error("Error setting primary image:", error)
    return { success: false, error: "Failed to set primary image" }
  }

  revalidatePath("/")
  return { success: true, error: null }
}

export async function setProductCategory(
  productId: string,
  categoryId: string | null
): Promise<{ success: boolean; error: string | null }> {
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
    .from("products")
    .update({
      category_id: categoryId,
      updated_at: new Date().toISOString()
    })
    .eq("id", productId)

  if (error) {
    console.error("Error setting product category:", error)
    return { success: false, error: "Failed to set product category" }
  }

  revalidatePath("/")
  return { success: true, error: null }
}
