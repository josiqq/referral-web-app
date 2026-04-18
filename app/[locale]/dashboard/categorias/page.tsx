import { redirect } from "@/i18n/routing"
import { setRequestLocale } from "next-intl/server"
import { createClient } from "@/lib/supabase/server"
import { getAllCategories } from "@/lib/actions/categories"
import CategoriesPanel from "@/components/admin/categories-panel"
import { Tag } from "lucide-react"

export default async function DashboardCategoriasPage({
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

  const result = await getAllCategories()

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
          <Tag className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-500 text-sm">Organizá los productos por categorías con banners visuales.</p>
        </div>
      </div>
      {result.error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">{result.error}</div>
      ) : (
        <CategoriesPanel initialCategories={result.data ?? []} />
      )}
    </div>
  )
}
