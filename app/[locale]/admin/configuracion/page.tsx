import { setRequestLocale } from "next-intl/server"
import { getAdvisorSettings } from "@/lib/actions/settings"
import SettingsPanel from "@/components/admin/settings-panel"
import { Settings } from "lucide-react"

export default async function AdminConfiguracionPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const settings = await getAdvisorSettings()

  if (!settings) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">
          No se pudo cargar la configuración. Verificá que la migración
          <code className="mx-1 font-mono bg-red-100 px-1 rounded">20260419000000_advisor_settings.sql</code>
          fue ejecutada en Supabase.
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
          <Settings className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-500 text-sm">
            Foto de perfil, datos de contacto y textos que aparecen en la landing.
          </p>
        </div>
      </div>

      <SettingsPanel initial={settings} />
    </div>
  )
}
