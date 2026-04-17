"use client"

import { useState, useTransition } from "react"
import { createReferralCode, deactivateReferralCode } from "@/lib/actions/referrals"
import type { ReferralCode } from "@/lib/actions/referrals"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Plus, Copy, Check, XCircle, Loader2,
  CheckCircle2, Clock, User, CalendarDays
} from "lucide-react"

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <button
      onClick={handleCopy}
      className="text-gray-400 hover:text-emerald-600 transition-colors"
      title="Copiar código"
    >
      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
    </button>
  )
}

function StatusBadge({ code }: { code: ReferralCode }) {
  if (code.used_by) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3" /> Usado
      </span>
    )
  }
  if (!code.is_active) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium bg-red-50 text-red-500 px-2 py-0.5 rounded-full">
        <XCircle className="w-3 h-3" /> Inactivo
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
      <Clock className="w-3 h-3" /> Disponible
    </span>
  )
}

export default function ReferralCodesPanel({
  initialCodes,
  members,
}: {
  initialCodes: ReferralCode[]
  members: { id: string; display_name: string | null; email: string }[]
}) {
  const [codes, setCodes] = useState<ReferralCode[]>(initialCodes)
  const [notes, setNotes] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [isPending, startTransition] = useTransition()
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  function handleCreate() {
    setSuccessMsg(null)
    startTransition(async () => {
      const result = await createReferralCode({
        assignedTo: assignedTo || null,
        notes: notes || undefined,
      })
      if (result.data) {
        setCodes(prev => [result.data!, ...prev])
        setNotes("")
        setAssignedTo("")
        setSuccessMsg(`Código ${result.data.code} creado exitosamente.`)
        setTimeout(() => setSuccessMsg(null), 3000)
      }
    })
  }

  function handleDeactivate(codeId: string) {
    startTransition(async () => {
      const result = await deactivateReferralCode(codeId)
      if (result.success) {
        setCodes(prev =>
          prev.map(c => c.id === codeId ? { ...c, is_active: false } : c)
        )
      }
    })
  }

  const available = codes.filter(c => c.is_active && !c.used_by).length
  const used = codes.filter(c => !!c.used_by).length

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: codes.length, color: "text-gray-700", bg: "bg-gray-50 border-gray-100" },
          { label: "Disponibles", value: available, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
          { label: "Usados", value: used, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 text-center ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Create form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Generar nuevo código</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-600">Asignar a (opcional)</Label>
            <select
              value={assignedTo}
              onChange={e => setAssignedTo(e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Sin asignar</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.display_name ?? m.email}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-600">Notas (opcional)</Label>
            <Input
              placeholder="Ej: Para Juan Pérez"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="h-10"
            />
          </div>
        </div>

        {successMsg && (
          <div className="mt-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
            <Check className="w-4 h-4" /> {successMsg}
          </div>
        )}

        <Button
          onClick={handleCreate}
          disabled={isPending}
          className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
        >
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generando...</>
          ) : (
            <><Plus className="w-4 h-4" /> Generar código</>
          )}
        </Button>
      </div>

      {/* Codes list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Todos los códigos</h2>
        </div>

        {codes.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No hay códigos generados aún.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {codes.map(code => (
              <div key={code.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="font-mono text-base font-bold text-gray-800 tracking-wider shrink-0">
                    {code.code}
                  </div>
                  <CopyButton text={code.code} />
                </div>

                <div className="flex flex-col gap-1 flex-1 min-w-0 px-2">
                  {code.assigned_profile && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <User className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        Para: {code.assigned_profile.display_name ?? code.assigned_profile.email}
                      </span>
                    </div>
                  )}
                  {code.used_profile && (
                    <div className="flex items-center gap-1 text-xs text-blue-500">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        Usado por: {code.used_profile.display_name ?? code.used_profile.email}
                      </span>
                    </div>
                  )}
                  {code.notes && (
                    <p className="text-xs text-gray-400 truncate">{code.notes}</p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <CalendarDays className="w-3 h-3 shrink-0" />
                    {new Date(code.created_at).toLocaleDateString("es-PY", { day: "2-digit", month: "short", year: "numeric" })}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge code={code} />
                  {code.is_active && !code.used_by && (
                    <button
                      onClick={() => handleDeactivate(code.id)}
                      disabled={isPending}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                      title="Desactivar código"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
