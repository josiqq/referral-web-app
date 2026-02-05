import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { About } from "@/components/landing/about"
import { Products, ProductsStatic, ProductsGrouped } from "@/components/landing/products"
import { Benefits } from "@/components/landing/benefits"
import { Testimonials } from "@/components/landing/testimonials"
import { Contact } from "@/components/landing/contact"
import { FAQ } from "@/components/landing/faq"
import { Footer } from "@/components/landing/footer"
import { getProductsGroupedByCategory } from "@/lib/actions/products"

export default async function LandingPage() {
  const { data: groupedProducts } = await getProductsGroupedByCategory()

  // Check if we have any products with categories
  const hasCategories = groupedProducts?.some(group => group.category !== null)

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <About />
      {groupedProducts && groupedProducts.length > 0 ? (
        hasCategories ? (
          <ProductsGrouped groupedProducts={groupedProducts} />
        ) : (
          <Products products={groupedProducts.flatMap(g => g.products)} />
        )
      ) : (
        <ProductsStatic />
      )}
      <Benefits />
      <Testimonials />
      <Contact />
      <FAQ />
      <Footer />
    </main>
  )
}
