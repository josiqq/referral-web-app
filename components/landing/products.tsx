"use client"

import { useState } from "react"
import Image from "next/image"
import { Check, MessageCircle, ChevronLeft, ChevronRight, Package } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CategoryHero } from "./category-hero"

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

interface ProductsProps {
  products: Product[]
}

interface ProductsGroupedProps {
  groupedProducts: { category: ProductCategory | null; products: Product[] }[]
}

function ProductImageGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1
    return a.display_order - b.display_order
  })

  if (sortedImages.length === 0) {
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
        <Package className="h-24 w-24 text-muted-foreground/30" />
      </div>
    )
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="relative">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted">
        <Image
          src={sortedImages[currentIndex].image_url}
          alt={sortedImages[currentIndex].alt_text || productName}
          fill
          className="object-cover transition-all duration-300"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {sortedImages.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-background"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-background"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {sortedImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  index === currentIndex ? "bg-primary w-6" : "bg-background/60"
                )}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {sortedImages.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {sortedImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg transition-all",
                index === currentIndex ? "ring-2 ring-primary" : "opacity-60 hover:opacity-100"
              )}
            >
              <Image
                src={image.image_url}
                alt={image.alt_text || `${productName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ProductSection({ product, index }: { product: Product; index: number }) {
  const t = useTranslations("landing.products")
  const isEven = index % 2 === 0

  const whatsappNumber = "+595986259004"
  const getWhatsappLink = (productName: string) => {
    const message = encodeURIComponent(`Hola! Me interesa el producto ${productName}. ¿Podrias darme mas informacion?`)
    return `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`
  }

  return (
    <div className={cn(
      "py-16 md:py-24",
      index > 0 && "border-t border-border/50"
    )}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={cn(
          "grid gap-8 md:gap-12 lg:gap-16 items-center",
          "grid-cols-1 md:grid-cols-2",
          !isEven && "md:[&>*:first-child]:order-2"
        )}>
          {/* Image Gallery */}
          <div className="w-full">
            <ProductImageGallery
              images={product.images || []}
              productName={product.name}
            />
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div>
              <h3 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {product.name}
              </h3>
              {product.short_description && (
                <p className="mt-4 text-lg text-muted-foreground">
                  {product.short_description}
                </p>
              )}
            </div>

            {product.description && (
              <p className="text-base text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}

            {product.benefits && product.benefits.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">{t("benefitsTitle")}</h4>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {product.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90"
              >
                <a
                  href={getWhatsappLink(product.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  {t("consultButton")}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Products({ products }: ProductsProps) {
  const t = useTranslations("landing.products")

  return (
    <section id="products" className="bg-gradient-to-b from-background to-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {products.map((product, index) => (
        <ProductSection key={product.id} product={product} index={index} />
      ))}
    </section>
  )
}

export function ProductsGrouped({ groupedProducts }: ProductsGroupedProps) {
  const t = useTranslations("landing.products")

  return (
    <section id="products" className="bg-gradient-to-b from-background to-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {groupedProducts.map((group, groupIndex) => (
        <div key={group.category?.id || "uncategorized"}>
          {/* Category Hero - only shown if category exists */}
          {group.category && (
            <CategoryHero
              name={group.category.name}
              description={group.category.description}
              image_url={group.category.image_url}
            />
          )}

          {/* Products in this category */}
          {group.products.map((product, productIndex) => (
            <ProductSection
              key={product.id}
              product={product}
              index={groupIndex === 0 && !group.category ? productIndex : productIndex}
            />
          ))}
        </div>
      ))}
    </section>
  )
}

// Static fallback for when products aren't loaded from DB
export function ProductsStatic() {
  const t = useTranslations("landing.products")

  const staticProducts = [
    "teralife_gotas",
    "teralife_colageno",
    "teralife_omega",
    "teralife_magnesio",
    "teralife_probioticos",
    "teralife_vitamina_d",
  ]

  const whatsappNumber = "+595986259004"
  const getWhatsappLink = (productName: string) => {
    const message = encodeURIComponent(`Hola! Me interesa el producto ${productName}. ¿Podrias darme mas informacion?`)
    return `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`
  }

  return (
    <section id="products" className="bg-gradient-to-b from-background to-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {staticProducts.map((key, index) => {
        const benefits = t.raw(`items.${key}.benefits`) as string[]
        const isEven = index % 2 === 0

        return (
          <div
            key={key}
            className={cn(
              "py-16 md:py-24",
              index > 0 && "border-t border-border/50"
            )}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className={cn(
                "grid gap-8 md:gap-12 lg:gap-16 items-center",
                "grid-cols-1 md:grid-cols-2",
                !isEven && "md:[&>*:first-child]:order-2"
              )}>
                {/* Placeholder Image */}
                <div className="w-full">
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <Package className="h-24 w-24 text-muted-foreground/30" />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                      {t(`items.${key}.name`)}
                    </h3>
                    <p className="mt-4 text-lg text-muted-foreground">
                      {t(`items.${key}.description`)}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">{t("benefitsTitle")}</h4>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                          <span className="text-sm text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                      asChild
                      size="lg"
                      className="bg-primary hover:bg-primary/90"
                    >
                      <a
                        href={getWhatsappLink(t(`items.${key}.name`))}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="mr-2 h-5 w-5" />
                        {t("consultButton")}
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </section>
  )
}
