"use client"

import { useState, useTransition, useRef } from "react"
import { updateAdvisorSettings, uploadAdvisorPhoto, type AdvisorSettings } from "@/lib/actions/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Loader2, Upload, User } from "lucide-react"

export default function SettingsPanel({ initial }: { initial: AdvisorSettings }) {
  const [s, setS] = useState(initial)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Photo upload
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const photoRef = useRef<HTMLInputElement>(null)

  function set(key: keyof AdvisorSettings, value: string) {
    setS(prev => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    setError(null); setSaved(false)
    startTransition(async () => {
      const result = await updateAdvisorSettings({
        display_name: s.display_name,
        role_title: s.role_title,
        bio: s.bio ?? "",
        whatsapp: s.whatsapp,
        email: s.email ?? "",
        location: s.location ?? "",
        stat_clients: s.stat_clients ?? "",
        stat_experience: s.stat_experience ?? "",
        stat_products: s.stat_products ?? "",
        whatsapp_message: s.whatsapp_message ?? "",
        office_hours: s.office_hours ?? "",
      })
      if (result.success) setSaved(true)
      else setError(result.error ?? "Error al guardar")
      setTimeout(() => setSaved(false), 3000)
    })
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoError(null); setPhotoUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    const result = await uploadAdvisorPhoto(fd)
    if (result.url) setS(prev => ({ ...prev, photo_url: result.url! }))
    else setPhotoError(result.error)
    setPhotoUploading(false)
    if (photoRef.current) photoRef.current.value = ""
  }

  return (
    <div className="space-y-8">

      {/* Photo section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-5">Foto de perfil</h2>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
            {s.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.photo_url} alt="Foto de perfil" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <User className="w-10 h-10" />
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Esta foto aparece en el Hero de la landing. Recomendado: cuadrada, mínimo 400×400px, JPEG/PNG/WebP, máx 5MB.
            </p>
            <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhoto} />
            <Button
              variant="outline"
              size="sm"
              disabled={photoUploading}
              onClick={() => photoRef.current?.click()}
              className="gap-1.5"
            >
              {photoUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {photoUploading ? "Subiendo..." : "Cambiar foto"}
            </Button>
            {photoError && <p className="text-xs text-red-500 mt-2">{photoError}</p>}
          </div>
        </div>
      </div>

      {/* Identity */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-5">Identidad del asesor</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-600">Nombre completo</Label>
            <Input value={s.display_name} onChange={e => set("display_name", e.target.value)} className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-600">Título / rol</Label>
            <Input value={s.role_title} onChange={e => set("role_title", e.target.value)} className="h-10" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-sm text-gray-600">Bio (aparece en el hero)</Label>
            <textarea
              value={s.bio ?? ""}
              onChange={e => set("bio", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-5">Información de contacto</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-600">WhatsApp (con código de país)</Label>
            <Input value={s.whatsapp} onChange={e => set("whatsapp", e.target.value)} className="h-10" placeholder="+595986259004" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-600">Email</Label>
            <Input type="email" value={s.email ?? ""} onChange={e => set("email", e.target.value)} className="h-10" placeholder="tu@email.com" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-600">Ubicación</Label>
            <Input value={s.location ?? ""} onChange={e => set("location", e.target.value)} className="h-10" placeholder="Asunción, Paraguay" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-600">Horario de atención</Label>
            <Input value={s.office_hours ?? ""} onChange={e => set("office_hours", e.target.value)} className="h-10" placeholder="Lunes a Viernes: 9am - 6pm" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-sm text-gray-600">Mensaje de WhatsApp (pre-llenado al hacer clic)</Label>
            <Input value={s.whatsapp_message ?? ""} onChange={e => set("whatsapp_message", e.target.value)} className="h-10" />
          </div>
        </div>
      </div>

      {/* Hero stats */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-1">Estadísticas del Hero</h2>
        <p className="text-xs text-gray-400 mb-5">Los números que aparecen debajo de la foto principal.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-600">Clientes</Label>
            <Input value={s.stat_clients ?? ""} onChange={e => set("stat_clients", e.target.value)} className="h-10" placeholder="500+" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-600">Años de experiencia</Label>
            <Input value={s.stat_experience ?? ""} onChange={e => set("stat_experience", e.target.value)} className="h-10" placeholder="5+" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-600">Productos disponibles</Label>
            <Input value={s.stat_products ?? ""} onChange={e => set("stat_products", e.target.value)} className="h-10" placeholder="20+" />
          </div>
        </div>
      </div>

      {/* Save */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-5 py-3">
          {error}
        </div>
      )}

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-5 py-3 flex items-center gap-2">
          <Check className="w-4 h-4" /> Configuración guardada. Los cambios ya se ven en la landing.
        </div>
      )}

      <Button
        onClick={handleSave}
        disabled={isPending}
        className="text-white gap-2 px-8"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        {isPending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </div>
  )
}
