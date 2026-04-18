import { redirect } from "@/i18n/routing"
import { setRequestLocale } from "next-intl/server"
import { createClient } from "@/lib/supabase/server"
import { getAdvisorSettings } from "@/lib/actions/settings"
import SettingsPanel from "@/components/admin/settings-panel"
import { Settings } from "lucide-react"

export default async function DashboardConfiguracionPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user!.id).single()
  if (profile?.role !== "admin") redirect({ href: "/dashboard", locale })

  const settings = await getAdvisorSettings()

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
          <Settings className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-500 text-sm">Foto de perfil, datos de contacto y textos de la landing.</p>
        </div>
      </div>
      {!settings ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">
          No se pudo cargar la configuración. Verificá que la migración
          <code className="mx-1 font-mono bg-red-100 px-1 rounded">20260419000000_advisor_settings.sql</code>
          fue ejecutada en Supabase.
        </div>
      ) : (
        <SettingsPanel initial={settings} />
      )}
    </div>
  )
}
