import { redirect } from "@/i18n/routing"
import { setRequestLocale } from "next-intl/server"
import { createClient } from "@/lib/supabase/server"
import { getAdvisorSettings } from "@/lib/actions/settings"
import AboutPanel from "@/components/admin/about-panel"
import { UserCircle2 } from "lucide-react"

export default async function DashboardAboutPage({
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
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <UserCircle2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sobre Mí</h1>
          <p className="text-muted-foreground text-sm">
            Editá la sección &quot;Sobre Mí&quot; de la landing: foto, textos y valores.
          </p>
        </div>
      </div>

      {!settings ? (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-6 text-sm">
          No se pudo cargar la configuración. Verificá que la migración
          <code className="mx-1 font-mono bg-destructive/10 px-1 rounded">
            20260420000000_about_settings.sql
          </code>
          fue ejecutada en Supabase.
        </div>
      ) : (
        <AboutPanel initial={settings} />
      )}
    </div>
  )
}
