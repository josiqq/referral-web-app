import { setRequestLocale } from "next-intl/server"
import { getAllProducts } from "@/lib/actions/products"
import { getAllCategories } from "@/lib/actions/categories"
import ProductsPanel from "@/components/admin/products-panel"
import { Package } from "lucide-react"

export default async function AdminProductosPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [productsResult, categoriesResult] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
  ])

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
          <Package className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500 text-sm">Creá, editá y gestioná las imágenes de cada producto.</p>
        </div>
      </div>

      {productsResult.error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">
          {productsResult.error}
        </div>
      ) : (
        <ProductsPanel
          initialProducts={productsResult.data ?? []}
          categories={categoriesResult.data ?? []}
        />
      )}
    </div>
  )
}
