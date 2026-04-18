import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { About } from "@/components/landing/about"
import { ProductsPreview, ProductsPreviewStatic } from "@/components/landing/products-preview"
import { Benefits } from "@/components/landing/benefits"
import { Sponsors } from "@/components/landing/sponsors"
import { Testimonials } from "@/components/landing/testimonials"
import { ContactPreview } from "@/components/landing/contact-preview"
import { FAQ } from "@/components/landing/faq"
import { Footer } from "@/components/landing/footer"
import { getProductsGroupedByCategory } from "@/lib/actions/products"
import { createClient } from "@/lib/supabase/server"

export default async function LandingPage() {
  const supabase = await createClient()

  // Read session server-side — always accurate after middleware refreshed JWT
  const { data: { user } } = await supabase.auth.getUser()

  let userInfo = null
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, display_name")
      .eq("id", user.id)
      .single()

    userInfo = {
      isLoggedIn: true,
      isAdmin: profile?.role === "admin",
      displayName: profile?.display_name ?? null,
    }
  }

  const { data: groupedProducts } = await getProductsGroupedByCategory()
  const allProducts = groupedProducts?.flatMap((g) => g.products) ?? []

  return (
    <main className="min-h-screen bg-background">
      <Header userInfo={userInfo} />
      <Hero />
      <About />
      {allProducts.length > 0 ? (
        <ProductsPreview products={allProducts} />
      ) : (
        <ProductsPreviewStatic />
      )}
      <Benefits />
      <Sponsors />
      <Testimonials />
      <ContactPreview />
      <FAQ />
      <Footer />
    </main>
  )
}
