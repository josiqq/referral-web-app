"use client"

import { useState, useTransition, useRef } from "react"
import { createProduct, updateProduct, deleteProduct, type Product } from "@/lib/actions/products"
import { type ProductCategory } from "@/lib/actions/categories"
import { uploadProductImage, deleteProductImageFile } from "@/lib/actions/upload"
import { deleteProductImage, setPrimaryImage } from "@/lib/actions/products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Plus, Pencil, Trash2, X, Check, Loader2,
  ImagePlus, Star, StarOff, ChevronDown, ChevronUp,
  Eye, EyeOff, Upload
} from "lucide-react"

// ── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

// ── Image uploader ────────────────────────────────────────────────────────────

function ImageUploader({ product, onDone }: { product: Product; onDone: (updated: Product) => void }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    fd.append("isPrimary", product.images?.length === 0 ? "true" : "false")
    const result = await uploadProductImage(product.id, fd)
    if (result.error) { setError(result.error); setUploading(false); return }
    // Re-fetch via a simple reload trick — parent will refresh
    onDone({ ...product })
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="gap-1.5 text-xs"
      >
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
        {uploading ? "Subiendo..." : "Subir imagen"}
      </Button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

// ── Product form (create / edit) ─────────────────────────────────────────────

type FormData = {
  name: string
  slug: string
  short_description: string
  description: string
  benefits: string
  ingredients: string
  usage_instructions: string
  price: string
  is_active: boolean
  display_order: string
  category_id: string
}

const emptyForm: FormData = {
  name: "", slug: "", short_description: "", description: "",
  benefits: "", ingredients: "", usage_instructions: "",
  price: "", is_active: true, display_order: "0", category_id: "",
}

function productToForm(p: Product): FormData {
  return {
    name: p.name,
    slug: p.slug,
    short_description: p.short_description ?? "",
    description: p.description ?? "",
    benefits: (p.benefits ?? []).join("\n"),
    ingredients: p.ingredients ?? "",
    usage_instructions: p.usage_instructions ?? "",
    price: p.price?.toString() ?? "",
    is_active: p.is_active,
    display_order: p.display_order.toString(),
    category_id: p.category_id ?? "",
  }
}

function ProductForm({
  initial,
  categories,
  onSave,
  onCancel,
}: {
  initial: FormData
  categories: ProductCategory[]
  onSave: (fd: FormData) => Promise<void>
  onCancel: () => void
}) {
  const [fd, setFd] = useState<FormData>(initial)
  const [saving, setSaving] = useState(false)

  function set(key: keyof FormData, value: string | boolean) {
    setFd(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit() {
    setSaving(true)
    await onSave(fd)
    setSaving(false)
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-600">Nombre *</Label>
          <Input value={fd.name} onChange={e => { set("name", e.target.value); set("slug", toSlug(e.target.value)) }} className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-600">Slug</Label>
          <Input value={fd.slug} onChange={e => set("slug", e.target.value)} className="h-9 text-sm font-mono" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs text-gray-600">Descripción corta</Label>
          <Input value={fd.short_description} onChange={e => set("short_description", e.target.value)} className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs text-gray-600">Descripción larga</Label>
          <textarea
            value={fd.description}
            onChange={e => set("description", e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs text-gray-600">Beneficios (uno por línea)</Label>
          <textarea
            value={fd.benefits}
            onChange={e => set("benefits", e.target.value)}
            rows={4}
            placeholder="Fortalece el sistema inmune&#10;Mejora la energía"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-600">Ingredientes</Label>
          <Input value={fd.ingredients} onChange={e => set("ingredients", e.target.value)} className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-600">Modo de uso</Label>
          <Input value={fd.usage_instructions} onChange={e => set("usage_instructions", e.target.value)} className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-600">Precio (opcional)</Label>
          <Input type="number" value={fd.price} onChange={e => set("price", e.target.value)} className="h-9 text-sm" placeholder="0.00" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-600">Orden de visualización</Label>
          <Input type="number" value={fd.display_order} onChange={e => set("display_order", e.target.value)} className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-600">Categoría</Label>
          <select
            value={fd.category_id}
            onChange={e => set("category_id", e.target.value)}
            className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm bg-white focus:outline-none focus:ring-2"
          >
            <option value="">Sin categoría</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 pt-4">
          <input type="checkbox" id="is_active" checked={fd.is_active} onChange={e => set("is_active", e.target.checked)} className="rounded" />
          <Label htmlFor="is_active" className="text-sm text-gray-700">Producto activo</Label>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={handleSubmit} disabled={!fd.name || saving} className="text-white gap-1.5 text-sm">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {saving ? "Guardando..." : "Guardar"}
        </Button>
        <Button variant="ghost" onClick={onCancel} className="text-gray-500 text-sm gap-1.5">
          <X className="w-4 h-4" /> Cancelar
        </Button>
      </div>
    </div>
  )
}

// ── Product row ───────────────────────────────────────────────────────────────

function ProductRow({
  product,
  categories,
  onChange,
}: {
  product: Product
  categories: ProductCategory[]
  onChange: (updated: Product | null) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const primaryImg = product.images?.find(i => i.is_primary) ?? product.images?.[0]

  function handleDelete() {
    if (!confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return
    startTransition(async () => {
      await deleteProduct(product.id)
      onChange(null)
    })
  }

  async function handleSave(fd: FormData) {
    const result = await updateProduct({
      id: product.id,
      name: fd.name,
      slug: fd.slug,
      short_description: fd.short_description || undefined,
      description: fd.description || undefined,
      benefits: fd.benefits.split("\n").map(s => s.trim()).filter(Boolean),
      ingredients: fd.ingredients || undefined,
      usage_instructions: fd.usage_instructions || undefined,
      price: fd.price ? parseFloat(fd.price) : undefined,
      is_active: fd.is_active,
      display_order: parseInt(fd.display_order) || 0,
      category_id: fd.category_id || null,
    })
    if (result.data) onChange(result.data)
    setEditing(false)
  }

  async function handleDeleteImage(imgId: string, imgUrl: string) {
    await deleteProductImageFile(imgUrl)
    await deleteProductImage(imgId)
    onChange({ ...product, images: product.images?.filter(i => i.id !== imgId) })
  }

  async function handleSetPrimary(imgId: string) {
    await setPrimaryImage(product.id, imgId)
    onChange({
      ...product,
      images: product.images?.map(i => ({ ...i, is_primary: i.id === imgId })),
    })
  }

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
      {/* Header row */}
      <div className="flex items-center gap-4 px-5 py-4">
        {primaryImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={primaryImg.image_url} alt={product.name} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-gray-100" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center text-gray-300">
            <ImagePlus className="w-5 h-5" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
            {!product.is_active && (
              <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">
                <EyeOff className="w-3 h-3" /> Inactivo
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 truncate mt-0.5">{product.short_description ?? product.slug}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600" onClick={() => { setEditing(e => !e); setExpanded(false) }}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400" onClick={() => { setExpanded(e => !e); setEditing(false) }}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={handleDelete} disabled={isPending}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="px-5 pb-5">
          <ProductForm
            initial={productToForm(product)}
            categories={categories}
            onSave={handleSave}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}

      {/* Image gallery */}
      {expanded && !editing && (
        <div className="px-5 pb-5 border-t border-gray-50 pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Imágenes</p>
          <div className="flex flex-wrap gap-3 mb-3">
            {(product.images ?? []).map(img => (
              <div key={img.id} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.image_url} alt="" className="w-20 h-20 rounded-lg object-cover border border-gray-100" />
                <div className="absolute inset-0 rounded-lg bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <button onClick={() => handleSetPrimary(img.id)} title={img.is_primary ? "Principal" : "Hacer principal"}
                    className="p-1 bg-white/90 rounded text-yellow-500 hover:text-yellow-600">
                    {img.is_primary ? <Star className="w-3.5 h-3.5 fill-current" /> : <StarOff className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => handleDeleteImage(img.id, img.image_url)}
                    className="p-1 bg-white/90 rounded text-red-500 hover:text-red-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {img.is_primary && (
                  <span className="absolute bottom-1 left-1 text-xs bg-yellow-400 text-yellow-900 px-1 rounded font-medium">★</span>
                )}
              </div>
            ))}
          </div>
          <ImageUploader product={product} onDone={() => onChange({ ...product })} />
        </div>
      )}
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────

export default function ProductsPanel({
  initialProducts,
  categories,
}: {
  initialProducts: Product[]
  categories: ProductCategory[]
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [creating, setCreating] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleChange(id: string, updated: Product | null) {
    if (updated === null) {
      setProducts(prev => prev.filter(p => p.id !== id))
    } else {
      setProducts(prev => prev.map(p => p.id === id ? updated : p))
    }
  }

  async function handleCreate(fd: FormData) {
    const result = await createProduct({
      name: fd.name,
      slug: fd.slug,
      short_description: fd.short_description || undefined,
      description: fd.description || undefined,
      benefits: fd.benefits.split("\n").map(s => s.trim()).filter(Boolean),
      ingredients: fd.ingredients || undefined,
      usage_instructions: fd.usage_instructions || undefined,
      price: fd.price ? parseFloat(fd.price) : undefined,
      is_active: fd.is_active,
      display_order: parseInt(fd.display_order) || products.length,
      category_id: fd.category_id || undefined,
    })
    if (result.data) {
      setProducts(prev => [...prev, result.data!])
      setCreating(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{products.length} productos</p>
        <Button
          onClick={() => setCreating(c => !c)}
          className="text-white gap-1.5 text-sm"
        >
          {creating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {creating ? "Cancelar" : "Nuevo producto"}
        </Button>
      </div>

      {/* Create form */}
      {creating && (
        <ProductForm
          initial={emptyForm}
          categories={categories}
          onSave={handleCreate}
          onCancel={() => setCreating(false)}
        />
      )}

      {/* List */}
      <div className="space-y-3">
        {products.length === 0 && !creating && (
          <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
            No hay productos. Creá el primero.
          </div>
        )}
        {products.map(p => (
          <ProductRow
            key={p.id}
            product={p}
            categories={categories}
            onChange={updated => handleChange(p.id, updated)}
          />
        ))}
      </div>
    </div>
  )
}
