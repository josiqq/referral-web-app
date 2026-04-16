"use client"

import Image from "next/image"
import { Package, ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProductImage {
  id: string
  image_url: string
  alt_text: string | null
  is_primary: boolean
  display_order: number
}

interface ProductCategory {
  id: string
  slug: string
  name: string
  description: string | null
  image_url: string | null
  display_order: number
  is_active: boolean
}

interface Product {
  id: string
  slug: string
  name: string
  short_description: string | null
  description: string | null
  benefits: string[]
  images?: ProductImage[]
  category?: ProductCategory | null
}

interface ProductsPreviewProps {
  products: Product[]
}

function getPrimaryImage(images?: ProductImage[]) {
  if (!images || images.length === 0) return null
  return (
    images.find((img) => img.is_primary) ||
    [...images].sort((a, b) => a.display_order - b.display_order)[0]
  )
}

export function ProductsPreview({ products }: ProductsPreviewProps) {
  const t = useTranslations("landing.products")

  const preview = products.slice(0, 3)

  return (
    <section id="products" className="border-t border-border bg-gradient-to-b from-background to-muted/30 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        {/* Cards */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {preview.map((product) => {
            const image = getPrimaryImage(product.images)
            return (
              <div
                key={product.id}
                className="group rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-primary/30 hover:shadow-lg"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-primary/5 to-muted">
                  {image ? (
                    <Image
                      src={image.image_url}
                      alt={image.alt_text || product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-16 w-16 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {product.category && (
                    <span className="text-xs font-medium uppercase tracking-wider text-primary">
                      {product.category.name}
                    </span>
                  )}
                  <h3 className="mt-1 text-xl font-semibold text-foreground">
                    {product.name}
                  </h3>
                  {product.short_description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {product.short_description}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link href="/productos">
              {t("viewAll")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export function ProductsPreviewStatic() {
  const t = useTranslations("landing.products")

  const staticKeys = ["teralife_gotas", "teralife_colageno", "teralife_omega"]

  return (
    <section id="products" className="border-t border-border bg-gradient-to-b from-background to-muted/30 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {staticKeys.map((key) => (
            <div
              key={key}
              className="group rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-primary/30 hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-primary/5 to-muted flex items-center justify-center">
                <Package className="h-16 w-16 text-muted-foreground/30" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-foreground">
                  {t(`items.${key}.name`)}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {t(`items.${key}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link href="/productos">
              {t("viewAll")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
