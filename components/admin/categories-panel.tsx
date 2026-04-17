"use client"

import { useState, useTransition, useRef } from "react"
import {
  createCategory, updateCategory, deleteCategory,
  type ProductCategory,
} from "@/lib/actions/categories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, X, Check, Loader2, EyeOff, Upload, ImagePlus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

type CatForm = {
  name: string; slug: string; description: string
  image_url: string; is_active: boolean; display_order: string
}

const emptyForm: CatForm = {
  name: "", slug: "", description: "",
  image_url: "", is_active: true, display_order: "0",
}

function categoryToForm(c: ProductCategory): CatForm {
  return {
    name: c.name, slug: c.slug, description: c.description ?? "",
    image_url: c.image_url ?? "", is_active: c.is_active,
    display_order: c.display_order.toString(),
  }
}

// ── Banner uploader (direct to Supabase) ─────────────────────────────────────

function BannerUploader({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const ref = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split(".").pop()
    const path = `categories/${Date.now()}.${ext}`
    const { data, error: err } = await supabase.storage
      .from("product-images")
      .upload(path, file, { upsert: true })
    if (err) { setError(err.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(data.path)
    onUploaded(publicUrl)
    setUploading(false)
    if (ref.current) ref.current.value = ""
  }

  return (
    <div>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
      <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => ref.current?.click()} className="gap-1.5 text-xs">
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
        {uploading ? "Subiendo..." : "Subir banner"}
      </Button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function CategoryForm({
  initial, onSave, onCancel,
}: {
  initial: CatForm
  onSave: (fd: CatForm) => Promise<void>
  onCancel: () => void
}) {
  const [fd, setFd] = useState<CatForm>(initial)
  const [saving, setSaving] = useState(false)
  function set(key: keyof CatForm, value: string | boolean) {
    setFd(prev => ({ ...prev, [key]: value }))
  }
  async function handleSubmit() {
    setSaving(true); await onSave(fd); setSaving(false)
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
          <Label className="text-xs text-gray-600">Descripción</Label>
          <Input value={fd.description} onChange={e => set("description", e.target.value)} className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs text-gray-600">URL del banner</Label>
          <div className="flex gap-2 items-center">
            <Input value={fd.image_url} onChange={e => set("image_url", e.target.value)} className="h-9 text-sm flex-1" placeholder="https://..." />
            <BannerUploader onUploaded={url => set("image_url", url)} />
          </div>
          {fd.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fd.image_url} alt="preview" className="mt-2 h-20 rounded-lg object-cover border border-gray-200" />
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-600">Orden</Label>
          <Input type="number" value={fd.display_order} onChange={e => set("display_order", e.target.value)} className="h-9 text-sm" />
        </div>
        <div className="flex items-center gap-2 pt-4">
          <input type="checkbox" id="cat_active" checked={fd.is_active} onChange={e => set("is_active", e.target.checked)} className="rounded" />
          <Label htmlFor="cat_active" className="text-sm text-gray-700">Categoría activa</Label>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button onClick={handleSubmit} disabled={!fd.name || saving} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-sm">
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

function CategoryRow({
  cat, onChange,
}: {
  cat: ProductCategory
  onChange: (updated: ProductCategory | null) => void
}) {
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`¿Eliminar "${cat.name}"?`)) return
    startTransition(async () => { await deleteCategory(cat.id); onChange(null) })
  }

  async function handleSave(fd: CatForm) {
    const result = await updateCategory({
      id: cat.id, name: fd.name, slug: fd.slug,
      description: fd.description || undefined,
      image_url: fd.image_url || undefined,
      is_active: fd.is_active,
      display_order: parseInt(fd.display_order) || 0,
    })
    if (result.data) onChange(result.data)
    setEditing(false)
  }

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
      <div className="flex items-center gap-4 px-5 py-4">
        {cat.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cat.image_url} alt={cat.name} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-gray-100" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center text-gray-300">
            <ImagePlus className="w-5 h-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-800 truncate">{cat.name}</p>
            {!cat.is_active && (
              <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">
                <EyeOff className="w-3 h-3" /> Inactiva
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 font-mono">{cat.slug}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600" onClick={() => setEditing(e => !e)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={handleDelete} disabled={isPending}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      {editing && (
        <div className="px-5 pb-5">
          <CategoryForm initial={categoryToForm(cat)} onSave={handleSave} onCancel={() => setEditing(false)} />
        </div>
      )}
    </div>
  )
}

export default function CategoriesPanel({ initialCategories }: { initialCategories: ProductCategory[] }) {
  const [categories, setCategories] = useState<ProductCategory[]>(initialCategories)
  const [creating, setCreating] = useState(false)

  function handleChange(id: string, updated: ProductCategory | null) {
    if (updated === null) setCategories(prev => prev.filter(c => c.id !== id))
    else setCategories(prev => prev.map(c => c.id === id ? updated : c))
  }

  async function handleCreate(fd: CatForm) {
    const result = await createCategory({
      name: fd.name, slug: fd.slug,
      description: fd.description || undefined,
      image_url: fd.image_url || undefined,
      is_active: fd.is_active,
      display_order: parseInt(fd.display_order) || categories.length,
    })
    if (result.data) { setCategories(prev => [...prev, result.data!]); setCreating(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{categories.length} categorías</p>
        <Button onClick={() => setCreating(c => !c)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-sm">
          {creating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {creating ? "Cancelar" : "Nueva categoría"}
        </Button>
      </div>
      {creating && (
        <CategoryForm initial={emptyForm} onSave={handleCreate} onCancel={() => setCreating(false)} />
      )}
      <div className="space-y-3">
        {categories.length === 0 && !creating && (
          <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
            No hay categorías. Creá la primera.
          </div>
        )}
        {categories.map(c => (
          <CategoryRow key={c.id} cat={c} onChange={updated => handleChange(c.id, updated)} />
        ))}
      </div>
    </div>
  )
}
