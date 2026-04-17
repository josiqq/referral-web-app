import { setRequestLocale } from "next-intl/server"
import { getAdminStats } from "@/lib/actions/admin"
import { Package, Tag, Users, KeyRound, ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const stats = await getAdminStats()

  const cards = [
    {
      href: "/admin/productos",
      icon: Package,
      label: "Productos",
      value: "totalProducts" in stats ? stats.totalProducts : "—",
      sub: "totalProducts" in stats ? `${stats.activeProducts} activos` : "",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      href: "/admin/categorias",
      icon: Tag,
      label: "Categorías",
      value: "—",
      sub: "Gestionar categorías",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      href: "/admin/codigos",
      icon: KeyRound,
      label: "Códigos de invitación",
      value: "—",
      sub: "Generar y gestionar",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      href: "/admin/configuracion",
      icon: Users,
      label: "Configuración",
      value: "totalUsers" in stats ? stats.totalUsers : "—",
      sub: "Foto, contacto, bio",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Resumen general del panel de administración.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map(({ href, icon: Icon, label, value, sub, color, bg }) => (
          <Link
            key={href}
            href={href}
            className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-gray-200 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
