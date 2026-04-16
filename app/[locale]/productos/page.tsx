import { Header } from "@/components/landing/header"
import { Products, ProductsStatic, ProductsGrouped } from "@/components/landing/products"
import { Footer } from "@/components/landing/footer"
import { getProductsGroupedByCategory } from "@/lib/actions/products"

export default async function ProductosPage() {
  const { data: groupedProducts } = await getProductsGroupedByCategory()

  const hasCategories = groupedProducts?.some(group => group.category !== null)

  return (
    <main className="min-h-screen bg-background">
      <Header />
      {groupedProducts && groupedProducts.length > 0 ? (
        hasCategories ? (
          <ProductsGrouped groupedProducts={groupedProducts} />
        ) : (
          <Products products={groupedProducts.flatMap(g => g.products)} />
        )
      ) : (
        <ProductsStatic />
      )}
      <Footer />
    </main>
  )
}
