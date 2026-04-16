import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { About } from "@/components/landing/about"
import { ProductsPreview, ProductsPreviewStatic } from "@/components/landing/products-preview"
import { Benefits } from "@/components/landing/benefits"
import { Testimonials } from "@/components/landing/testimonials"
import { ContactPreview } from "@/components/landing/contact-preview"
import { FAQ } from "@/components/landing/faq"
import { Footer } from "@/components/landing/footer"
import { getProductsGroupedByCategory } from "@/lib/actions/products"

export default async function LandingPage() {
  const { data: groupedProducts } = await getProductsGroupedByCategory()

  const allProducts = groupedProducts?.flatMap((g) => g.products) ?? []

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <About />
      {allProducts.length > 0 ? (
        <ProductsPreview products={allProducts} />
      ) : (
        <ProductsPreviewStatic />
      )}
      <Benefits />
      <Testimonials />
      <ContactPreview />
      <FAQ />
      <Footer />
    </main>
  )
}
