"use client"

import { useState, useTransition, useRef } from "react"
import {
  createSponsor, updateSponsor, deleteSponsor,
  reorderSponsors, uploadSponsorLogo, type Sponsor,
  toggleSponsorsSection,
} from "@/lib/actions/sponsors"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Check, Loader2, Upload, ImageIcon, Plus, Trash2,
  GripVertical, ExternalLink, Power, PowerOff, Pencil, X,
} from "lucide-react"
import { AdvisorSettings, updateAdvisorSettings } from "@/lib/actions/settings"

// ─── Toggle de sección ────────────────────────────────────────────────────────

function SectionToggle({
  enabled,
  title,
  subtitle,
  onToggle,
  onTitleChange,
  onSubtitleChange,
}: {
  enabled: boolean
  title: string
  subtitle: string
  onToggle: (v: boolean) => void
  onTitleChange: (v: string) => void
  onSubtitleChange: (v: string) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleToggle() {
    startTransition(async () => {
      const res = await toggleSponsorsSection(!enabled)
      if (res.success) onToggle(!enabled)
      else setError(res.error ?? "Error")
    })
  }

  function handleSaveTexts() {
    setError(null); setSaved(false)
    startTransition(async () => {
      const res = await updateAdvisorSettings({
        sponsors_title: title,
        sponsors_subtitle: subtitle,
      } as Parameters<typeof updateAdvisorSettings>[0])
      if (res.success) { setSaved(true); setTimeout(() => setSaved(false), 2500) }
      else setError(res.error ?? "Error")
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Sección en la landing</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Activá o desactivá la sección de patrocinadores en la página principal.
          </p>
        </div>
        <button
          onClick={handleToggle}
          disabled={isPending}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all
            ${enabled
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
              : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
            }`}
        >
          {isPending
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : enabled ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />
          }
          {enabled ? "Activa" : "Inactiva"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm text-gray-600">Título de la sección</Label>
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="h-10"
            placeholder="Nuestros Patrocinadores"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm text-gray-600">Subtítulo (opcional)</Label>
          <Input
            value={subtitle}
            onChange={(e) => onSubtitleChange(e.target.value)}
            className="h-10"
            placeholder="Marcas y aliados que confían en nosotros"
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex items-center gap-3">
        <Button size="sm" onClick={handleSaveTexts} disabled={isPending} className="gap-1.5 text-white">
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          Guardar textos
        </Button>
        {saved && <span className="text-xs text-emerald-600 font-medium">¡Guardado!</span>}
      </div>
    </div>
  )
}

// ─── Formulario nuevo / edición ───────────────────────────────────────────────

function SponsorForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Sponsor
  onSave: (s: Sponsor) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? "")
  const [website, setWebsite] = useState(initial?.website_url ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")
  const [logoUrl, setLogoUrl] = useState(initial?.logo_url ?? null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoError(null); setLogoUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    const res = await uploadSponsorLogo(fd)
    if (res.url) setLogoUrl(res.url)
    else setLogoError(res.error)
    setLogoUploading(false)
    if (fileRef.current) fileRef.current.value = ""
  }

  function handleSubmit() {
    if (!name.trim()) { setError("El nombre es requerido"); return }
    setError(null)
    startTransition(async () => {
      if (initial) {
        const res = await updateSponsor(initial.id, {
          name, website_url: website || null,
          description: description || null, logo_url: logoUrl,
        })
        if (res.success) onSave({ ...initial, name, website_url: website || null, description: description || null, logo_url: logoUrl })
        else setError(res.error ?? "Error")
      } else {
        const res = await createSponsor({
          name, website_url: website || null,
          description: description || null, logo_url: logoUrl,
        })
        if (res.data) onSave(res.data)
        else setError(res.error ?? "Error")
      }
    })
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          {initial ? "Editar patrocinador" : "Nuevo patrocinador"}
        </h3>
        <button onClick={onCancel} className="p-1 text-muted-foreground hover:text-foreground rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Logo */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center">
          {logoUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
            : <ImageIcon className="w-7 h-7 text-gray-300" />
          }
        </div>
        <div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" className="hidden" onChange={handleLogo} />
          <Button variant="outline" size="sm" disabled={logoUploading} onClick={() => fileRef.current?.click()} className="gap-1.5">
            {logoUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {logoUploading ? "Subiendo..." : "Subir logo"}
          </Button>
          {logoError && <p className="text-xs text-red-500 mt-1">{logoError}</p>}
          <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP o SVG · máx 2MB</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm text-gray-600">Nombre *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9 text-sm" placeholder="Marca XYZ" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm text-gray-600">Sitio web</Label>
          <Input value={website} onChange={(e) => setWebsite(e.target.value)} className="h-9 text-sm" placeholder="https://..." />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-sm text-gray-600">Descripción breve (opcional)</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} className="h-9 text-sm" placeholder="Proveedor oficial de..." />
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={isPending} className="gap-1.5 text-white">
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          {initial ? "Actualizar" : "Agregar"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
    </div>
  )
}

// ─── Fila de sponsor ──────────────────────────────────────────────────────────

function SponsorRow({
  sponsor,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  sponsor: Sponsor
  onEdit: () => void
  onDelete: () => void
  onToggleActive: (v: boolean) => void
}) {
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    await deleteSponsor(sponsor.id)
    onDelete()
  }

  async function handleToggle() {
    setToggling(true)
    await updateSponsor(sponsor.id, { is_active: !sponsor.is_active })
    onToggleActive(!sponsor.is_active)
    setToggling(false)
  }

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors
      ${sponsor.is_active ? "border-border bg-card" : "border-border/50 bg-muted/40 opacity-60"}`}
    >
      <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0 cursor-grab" />

      {/* Logo */}
      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center">
        {sponsor.logo_url
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={sponsor.logo_url} alt={sponsor.name} className="w-full h-full object-contain p-0.5" />
          : <span className="text-xs font-bold text-gray-400">{sponsor.name.slice(0, 2).toUpperCase()}</span>
        }
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">{sponsor.name}</p>
        {sponsor.website_url && (
          <a
            href={sponsor.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="truncate">{sponsor.website_url}</span>
          </a>
        )}
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={handleToggle}
          disabled={toggling}
          title={sponsor.is_active ? "Desactivar" : "Activar"}
          className={`p-1.5 rounded-lg transition-colors text-xs
            ${sponsor.is_active
              ? "text-emerald-600 hover:bg-emerald-50"
              : "text-gray-400 hover:bg-gray-100"
            }`}
        >
          {toggling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Power className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  )
}

// ─── Panel principal ──────────────────────────────────────────────────────────

export default function SponsorsPanel({
  initial,
  initialSponsors,
}: {
  initial: AdvisorSettings
  initialSponsors: Sponsor[]
}) {
  const [enabled, setEnabled] = useState(initial.sponsors_enabled ?? false)
  const [title, setTitle] = useState(initial.sponsors_title ?? "Nuestros Patrocinadores")
  const [subtitle, setSubtitle] = useState(initial.sponsors_subtitle ?? "")
  const [sponsors, setSponsors] = useState<Sponsor[]>(initialSponsors)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  function handleSave(s: Sponsor) {
    setSponsors((prev) => {
      const exists = prev.find((x) => x.id === s.id)
      return exists ? prev.map((x) => (x.id === s.id ? s : x)) : [...prev, s]
    })
    setShowForm(false)
    setEditingId(null)
  }

  function handleDelete(id: string) {
    setSponsors((prev) => prev.filter((x) => x.id !== id))
  }

  function handleToggleActive(id: string, v: boolean) {
    setSponsors((prev) => prev.map((x) => (x.id === id ? { ...x, is_active: v } : x)))
  }

  return (
    <div className="space-y-6">
      <SectionToggle
        enabled={enabled}
        title={title}
        subtitle={subtitle}
        onToggle={setEnabled}
        onTitleChange={setTitle}
        onSubtitleChange={setSubtitle}
      />

      {/* Lista de sponsors */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Patrocinadores</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {sponsors.length === 0
                ? "Todavía no hay patrocinadores."
                : `${sponsors.filter((s) => s.is_active).length} activos · ${sponsors.length} en total`
              }
            </p>
          </div>
          {!showForm && !editingId && (
            <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5 text-white">
              <Plus className="w-4 h-4" />
              Agregar
            </Button>
          )}
        </div>

        {/* Formulario nuevo */}
        {showForm && (
          <div className="mb-4">
            <SponsorForm onSave={handleSave} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {/* Lista */}
        {sponsors.length === 0 && !showForm ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground">Agregá tu primer patrocinador arriba.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sponsors.map((s) =>
              editingId === s.id ? (
                <SponsorForm
                  key={s.id}
                  initial={s}
                  onSave={handleSave}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <SponsorRow
                  key={s.id}
                  sponsor={s}
                  onEdit={() => setEditingId(s.id)}
                  onDelete={() => handleDelete(s.id)}
                  onToggleActive={(v) => handleToggleActive(s.id, v)}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}
