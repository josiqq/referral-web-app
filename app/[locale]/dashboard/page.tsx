import { redirect } from "@/i18n/routing"
import { setRequestLocale } from "next-intl/server"
import { createClient } from "@/lib/supabase/server"
import { getMyTree } from "@/lib/actions/referrals"
import TeamTree from "@/components/dashboard/team-tree"
import { LogOut, Leaf, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import LogoutButton from "@/components/dashboard/logout-button"

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  // Auth guard
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect({ href: "/auth/login", locale })

  // Fetch tree data
  const { upline, me, downlineFlat, error } = await getMyTree()

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">

      {/* Top nav */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Teralife</span>
            <span className="text-gray-300 text-sm mx-1">/</span>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Mi Equipo
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">
              {me.display_name ?? me.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Mi Red de Equipo</h1>
          <p className="text-gray-500 text-sm mt-1">
            Aquí podés ver tu posición en la red, quién te invitó y todos los asesores que forman parte de tu equipo.
          </p>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">
            Error al cargar el árbol: {error}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-10">
            <TeamTree upline={upline} me={me} downlineFlat={downlineFlat} />
          </div>
        )}
      </main>
    </div>
  )
}
