import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getMyTree } from "@/lib/actions/referrals"
import TeamTree from "@/components/dashboard/team-tree"
import SignOutBtn from "@/components/dashboard/sign-out-btn"
import { Leaf, Network } from "lucide-react"

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const prefix = locale === "es" ? "" : `/${locale}`
    redirect(`${prefix}/auth/login`)
  }

  const { upline, me, downlineFlat, error } = await getMyTree()

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Top nav */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Teralife</span>
            <span className="hidden sm:block text-gray-300 mx-1">|</span>
            <span className="hidden sm:block text-sm text-gray-500">Mi Panel</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block truncate max-w-[180px]">
              {me.display_name ?? me.email}
            </span>
            <SignOutBtn />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hola, {me.display_name?.split(" ")[0] ?? "Asesor"} 👋
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Aquí puedes ver tu red de equipo Teralife.
          </p>
        </div>

        {/* Tree section */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Network className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-800">Mi Red de Equipo</h2>
          </div>

          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-5 py-4">
              Error al cargar tu red: {error}
            </div>
          ) : (
            <TeamTree upline={upline} me={me} downlineFlat={downlineFlat} />
          )}
        </section>

        {/* Empty state */}
        {downlineFlat.length === 0 && !error && (
          <div className="bg-white border border-dashed border-emerald-200 rounded-2xl px-6 py-8 text-center max-w-md mx-auto">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Network className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Tu red está vacía por ahora</h3>
            <p className="text-sm text-gray-500">
              Cuando alguien se una al equipo con tu código de invitación, aparecerá aquí en tu árbol.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
