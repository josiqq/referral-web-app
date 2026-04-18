import { redirect } from "@/i18n/routing"
import { setRequestLocale } from "next-intl/server"
import { createClient } from "@/lib/supabase/server"
import DashboardNav from "@/components/dashboard/dashboard-nav"

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect({ href: "/auth/login", locale })

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name, email")
    .eq("id", user.id)
    .single()

  const isAdmin = profile?.role === "admin"
  const displayName = profile?.display_name ?? null
  const email = profile?.email ?? user.email ?? ""

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardNav
        locale={locale}
        isAdmin={isAdmin}
        displayName={displayName}
        email={email}
      />
      {/* Offset for desktop sidebar (w-56) and mobile top bar (h-12) */}
      <main className="flex-1 overflow-auto pt-12 md:pt-0 md:ml-56">
        {children}
      </main>
    </div>
  )
}
