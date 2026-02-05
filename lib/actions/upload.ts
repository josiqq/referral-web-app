"use server"

import { createClient } from "@/lib/supabase/server"
import { addProductImage } from "./products"

export async function uploadProductImage(
  productId: string,
  formData: FormData
): Promise<{ url: string | null; error: string | null }> {
  const supabase = await createClient()

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { url: null, error: "Unauthorized" }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return { url: null, error: "Admin access required" }
  }

  const file = formData.get("file") as File
  if (!file) {
    return { url: null, error: "No file provided" }
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
  if (!allowedTypes.includes(file.type)) {
    return { url: null, error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" }
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return { url: null, error: "File too large. Maximum size is 5MB" }
  }

  // Generate unique filename
  const fileExt = file.name.split(".").pop()
  const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  // Upload to Supabase Storage
  const { data, error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

  if (uploadError) {
    console.error("Error uploading file:", uploadError)
    return { url: null, error: "Failed to upload file" }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from("product-images")
    .getPublicUrl(data.path)

  // Add image to database
  const altText = formData.get("altText") as string | null
  const isPrimary = formData.get("isPrimary") === "true"

  const { error: dbError } = await addProductImage(
    productId,
    publicUrl,
    altText || undefined,
    isPrimary
  )

  if (dbError) {
    // Try to delete the uploaded file if db insert fails
    await supabase.storage.from("product-images").remove([data.path])
    return { url: null, error: dbError }
  }

  return { url: publicUrl, error: null }
}

export async function deleteProductImageFile(imageUrl: string): Promise<{ success: boolean; error: string | null }> {
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

  // Extract path from URL
  const bucketName = "product-images"
  const urlParts = imageUrl.split(`/storage/v1/object/public/${bucketName}/`)
  if (urlParts.length !== 2) {
    return { success: false, error: "Invalid image URL" }
  }

  const filePath = urlParts[1]

  const { error } = await supabase.storage
    .from(bucketName)
    .remove([filePath])

  if (error) {
    console.error("Error deleting file:", error)
    return { success: false, error: "Failed to delete file" }
  }

  return { success: true, error: null }
}
