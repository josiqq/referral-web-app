import { redirect } from "@/i18n/routing"
import { setRequestLocale } from "next-intl/server"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/actions/admin"
import AdminNav from "@/components/admin/admin-nav"

export default async function AdminLayout({
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
  if (!(await isAdmin())) redirect({ href: "/dashboard", locale })

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminNav locale={locale} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
