import { setRequestLocale } from "next-intl/server"
import { createClient } from "@/lib/supabase/server"
import { getMyTree } from "@/lib/actions/referrals"
import { getAdminStats } from "@/lib/actions/admin"
import TeamTree from "@/components/dashboard/team-tree"
import { Package, Tag, Users, KeyRound, ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from("profiles").select("role, display_name").eq("id", user!.id).single()

  const isAdmin = profile?.role === "admin"

  const [treeData, statsData] = await Promise.all([
    getMyTree(),
    isAdmin ? getAdminStats() : Promise.resolve(null),
  ])

  const { upline, me, downlineFlat, error: treeError } = treeData

  const adminCards = isAdmin && statsData && "totalProducts" in statsData ? [
    {
      href: "/dashboard/productos",
      icon: Package,
      label: "Productos",
      value: statsData.totalProducts,
      sub: `${statsData.activeProducts} activos`,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      href: "/dashboard/categorias",
      icon: Tag,
      label: "Categorías",
      value: "—",
      sub: "Gestionar",
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      href: "/dashboard/codigos",
      icon: KeyRound,
      label: "Códigos",
      value: "—",
      sub: "Invitaciones",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      href: "/dashboard/configuracion",
      icon: Users,
      label: "Config.",
      value: statsData.totalUsers,
      sub: "Usuarios totales",
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
  ] : []

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Hola, {profile?.display_name ?? me.email} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isAdmin
            ? "Panel de administración y red de equipo."
            : "Tu posición en la red y el equipo que estás construyendo."}
        </p>
      </div>

      {/* Admin quick-access cards */}
      {adminCards.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {adminCards.map(({ href, icon: Icon, label, value, sub, color, bg }) => (
            <Link
              key={href}
              href={href}
              className="group bg-card rounded-2xl border border-border shadow-sm p-5 hover:shadow-md hover:border-primary/20 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xl font-bold text-foreground">{value}</p>
              <p className="text-xs font-medium text-foreground/70 mt-0.5">{label}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Team tree */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Mi Red de Equipo
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Tu upline, tu posición y todos los asesores de tu red hacia abajo.
          </p>
        </div>

        {treeError ? (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 text-sm">
            Error al cargar el árbol: {treeError}
          </div>
        ) : (
          <TeamTree upline={upline} me={me} downlineFlat={downlineFlat} />
        )}
      </div>
    </div>
  )
}
