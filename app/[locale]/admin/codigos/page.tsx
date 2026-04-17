import { setRequestLocale } from "next-intl/server"
import { redirect } from "@/i18n/routing"
import { createClient } from "@/lib/supabase/server"
import { listReferralCodes, listAllMembers } from "@/lib/actions/referrals"
import { isAdmin } from "@/lib/actions/admin"
import ReferralCodesPanel from "@/components/admin/referral-codes-panel"
import { Leaf, KeyRound } from "lucide-react"
import LogoutButton from "@/components/dashboard/logout-button"

export default async function AdminCodigosPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect({ href: "/auth/login", locale })
  if (!(await isAdmin())) redirect({ href: "/dashboard", locale })

  const [codesResult, membersResult] = await Promise.all([
    listReferralCodes(),
    listAllMembers(),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Nav */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Teralife Admin</span>
            <span className="text-gray-300 text-sm mx-1">/</span>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5" /> Códigos de Invitación
            </span>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Códigos de Invitación</h1>
          <p className="text-gray-500 text-sm mt-1">
            Generá y administrá los códigos que permiten a nuevos asesores unirse al equipo.
          </p>
        </div>

        {codesResult.error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">
            {codesResult.error}
          </div>
        ) : (
          <ReferralCodesPanel
            initialCodes={codesResult.data}
            members={membersResult.data}
          />
        )}
      </main>
    </div>
  )
}
