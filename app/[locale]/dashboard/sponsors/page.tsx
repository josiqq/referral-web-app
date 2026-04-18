import { redirect } from "@/i18n/routing"
import { setRequestLocale } from "next-intl/server"
import { createClient } from "@/lib/supabase/server"
import { getAdvisorSettings } from "@/lib/actions/settings"
import { getSponsors } from "@/lib/actions/sponsors"
import SponsorsPanel from "@/components/admin/sponsors-panel"
import { Handshake } from "lucide-react"

export default async function DashboardSponsorsPage({
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

  const [settings, sponsors] = await Promise.all([
    getAdvisorSettings(),
    getSponsors(false), // todos, incluyendo inactivos
  ])

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
          <Handshake className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patrocinadores</h1>
          <p className="text-muted-foreground text-sm">
            Activá la sección y gestioná los patrocinadores que aparecen en la landing.
          </p>
        </div>
      </div>

      {!settings ? (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-6 text-sm">
          No se pudo cargar la configuración. Verificá que las migraciones fueron ejecutadas en Supabase.
        </div>
      ) : (
        <SponsorsPanel initial={settings} initialSponsors={sponsors} />
      )}
    </div>
  )
}
