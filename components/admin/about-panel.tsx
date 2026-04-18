"use client"

import { useState, useTransition, useRef } from "react"
import {
  updateAboutSettings,
  uploadAboutPhoto,
  type AdvisorSettings,
  type AboutValue,
} from "@/lib/actions/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Check, Loader2, Upload, ImageIcon, Plus, Trash2,
  Heart, HandHeart, BookOpen, ChevronDown,
} from "lucide-react"

const ICON_OPTIONS = ["Heart", "HandHeart", "BookOpen"] as const
type IconName = (typeof ICON_OPTIONS)[number]

const ICON_COMPONENTS: Record<IconName, React.ElementType> = {
  Heart,
  HandHeart,
  BookOpen,
}

function IconPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const CurrentIcon = ICON_COMPONENTS[value as IconName] ?? Heart
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm hover:bg-gray-50 transition-colors w-full"
      >
        <CurrentIcon className="w-4 h-4 text-secondary shrink-0" />
        <span className="flex-1 text-left text-gray-700">{value}</span>
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
      </button>
      {open && (
        <div className="absolute top-11 left-0 z-10 bg-white border border-gray-200 rounded-xl shadow-lg p-2 flex gap-2">
          {ICON_OPTIONS.map((icon) => {
            const Icon = ICON_COMPONENTS[icon]
            return (
              <button
                key={icon}
                type="button"
                onClick={() => { onChange(icon); setOpen(false) }}
                className={`p-2 rounded-lg transition-colors ${value === icon ? "bg-secondary/10 text-secondary" : "hover:bg-gray-100 text-gray-500"}`}
                title={icon}
              >
                <Icon className="w-5 h-5" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ValuesEditor({
  values,
  onChange,
}: {
  values: AboutValue[]
  onChange: (v: AboutValue[]) => void
}) {
  function update(i: number, field: keyof AboutValue, val: string) {
    const next = values.map((v, idx) => (idx === i ? { ...v, [field]: val } : v))
    onChange(next)
  }
  function remove(i: number) {
    onChange(values.filter((_, idx) => idx !== i))
  }
  function add() {
    onChange([...values, { icon: "Heart", title: "", description: "" }])
  }

  return (
    <div className="space-y-3">
      {values.map((v, i) => (
        <div key={i} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Valor {i + 1}</span>
            <button
              type="button"
              onClick={() => remove(i)}
              className="p-1 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Ícono</Label>
              <IconPicker value={v.icon} onChange={(val) => update(i, "icon", val)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Título</Label>
              <Input
                value={v.title}
                onChange={(e) => update(i, "title", e.target.value)}
                className="h-10 text-sm"
                placeholder="Honestidad"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Descripción</Label>
              <Input
                value={v.description}
                onChange={(e) => update(i, "description", e.target.value)}
                className="h-10 text-sm"
                placeholder="Descripción breve..."
              />
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-500 hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Agregar valor
      </button>
    </div>
  )
}

export default function AboutPanel({ initial }: { initial: AdvisorSettings }) {
  const defaults: AboutValue[] = [
    { icon: "Heart", title: "Honestidad", description: "Te asesoro con transparencia sobre los productos que realmente necesitas." },
    { icon: "HandHeart", title: "Compromiso", description: "Te acompaño en todo tu proceso de bienestar." },
    { icon: "BookOpen", title: "Conocimiento", description: "Estoy constantemente capacitándome para ofrecerte la mejor información." },
  ]

  const [title, setTitle] = useState(initial.about_title ?? "Sobre Mí")
  const [subtitle, setSubtitle] = useState(initial.about_subtitle ?? "Conoce mi historia y mi pasión por el bienestar")
  const [bio, setBio] = useState(initial.about_bio ?? "")
  const [mission, setMission] = useState(initial.about_mission ?? "")
  const [photoUrl, setPhotoUrl] = useState(initial.about_photo_url ?? null)
  const [values, setValues] = useState<AboutValue[]>(initial.about_values ?? defaults)

  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const photoRef = useRef<HTMLInputElement>(null)

  function handleSave() {
    setSaveError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await updateAboutSettings({
        about_title: title,
        about_subtitle: subtitle,
        about_bio: bio,
        about_mission: mission,
        about_photo_url: photoUrl,
        about_values: values,
      })
      if (result.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setSaveError(result.error ?? "Error al guardar")
      }
    })
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoError(null)
    setPhotoUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    const result = await uploadAboutPhoto(fd)
    if (result.url) setPhotoUrl(result.url)
    else setPhotoError(result.error)
    setPhotoUploading(false)
    if (photoRef.current) photoRef.current.value = ""
  }

  return (
    <div className="space-y-6">

      {/* Foto de la sección About */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-1">Foto de la sección</h2>
        <p className="text-xs text-gray-400 mb-5">
          Imagen que aparece al lado del texto en la sección &quot;Sobre Mí&quot;. Recomendado: cuadrada, mínimo 400×400px.
        </p>
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="Foto about" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <ImageIcon className="w-10 h-10" />
              </div>
            )}
          </div>
          <div>
            <input
              ref={photoRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhoto}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={photoUploading}
              onClick={() => photoRef.current?.click()}
              className="gap-1.5"
            >
              {photoUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {photoUploading ? "Subiendo..." : "Cambiar foto"}
            </Button>
            {photoError && <p className="text-xs text-red-500 mt-2">{photoError}</p>}
          </div>
        </div>
      </div>

      {/* Títulos */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-5">Encabezado de la sección</h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-600">Título principal</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10"
              placeholder="Sobre Mí"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-600">Subtítulo</Label>
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="h-10"
              placeholder="Conoce mi historia y mi pasión por el bienestar"
            />
          </div>
        </div>
      </div>

      {/* Textos */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-5">Textos del cuerpo</h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-600">Biografía</Label>
            <p className="text-xs text-gray-400">Párrafo principal con tu historia personal.</p>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="Soy una apasionada del bienestar integral..."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-600">Misión</Label>
            <p className="text-xs text-gray-400">Segundo párrafo: tu propósito o misión.</p>
            <textarea
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="Mi misión es brindarte asesoría personalizada..."
            />
          </div>
        </div>
      </div>

      {/* Valores */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-1">Valores</h2>
        <p className="text-xs text-gray-400 mb-5">
          Tarjetas que aparecen al pie de la sección. Podés agregar, editar o eliminar.
        </p>
        <ValuesEditor values={values} onChange={setValues} />
      </div>

      {/* Feedback */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-5 py-3">
          {saveError}
        </div>
      )}
      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-5 py-3 flex items-center gap-2">
          <Check className="w-4 h-4" />
          Cambios guardados. Ya se ven en la landing.
        </div>
      )}

      <Button
        onClick={handleSave}
        disabled={isPending}
        className="text-white gap-2 px-8"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4" />
        )}
        {isPending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </div>
  )
}
