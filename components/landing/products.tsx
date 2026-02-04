"use client"

import { Check, Droplets, Sparkles, Fish, Pill, Apple, Sun, MessageCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const productIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  teralife_gotas: Droplets,
  teralife_colageno: Sparkles,
  teralife_omega: Fish,
  teralife_magnesio: Pill,
  teralife_probioticos: Apple,
  teralife_vitamina_d: Sun,
}

const productKeys = [
  "teralife_gotas",
  "teralife_colageno",
  "teralife_omega",
  "teralife_magnesio",
  "teralife_probioticos",
  "teralife_vitamina_d",
]

export function Products() {
  const t = useTranslations("landing.products")

  const whatsappNumber = "+1234567890"
  const getWhatsappLink = (productName: string) => {
    const message = encodeURIComponent(`Hola! Me interesa el producto ${productName}. ¿Podrías darme más información?`)
    return `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`
  }

  return (
    <section id="products" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {productKeys.map((key) => {
            const Icon = productIcons[key]
            const benefits = t.raw(`items.${key}.benefits`) as string[]

            return (
              <Card
                key={key}
                className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/30"
              >
                <CardHeader className="pb-4">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/10 transition-colors group-hover:bg-secondary/20">
                    <Icon className="h-7 w-7 text-secondary" />
                  </div>
                  <CardTitle className="text-xl">{t(`items.${key}.name`)}</CardTitle>
                  <CardDescription className="text-base">
                    {t(`items.${key}.description`)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                        <span className="text-sm text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className="mt-6 w-full bg-primary hover:bg-primary/90"
                  >
                    <a
                      href={getWhatsappLink(t(`items.${key}.name`))}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Consultar
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
