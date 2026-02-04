"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle, Users, Clock, Package } from "lucide-react"
import { useTranslations } from "next-intl"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Hero() {
  const t = useTranslations("landing.hero")

  const whatsappNumber = "+595986259004" // Cambiar por tu número
  const whatsappMessage = encodeURIComponent("Hola! Me interesa conocer más sobre los productos Teralife.")
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`

  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-1/4 -top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Contenido de texto */}
          <div className="text-center lg:text-left">
            <p className="text-lg font-medium text-primary">
              {t("greeting")}
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {t("name")}
            </h1>
            <p className="mt-2 text-xl font-medium text-muted-foreground">
              {t("role")}
            </p>

            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-muted-foreground lg:mx-0">
              {t("description")}
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              <Button
                size="lg"
                asChild
                className="w-full bg-primary hover:bg-primary/90 sm:w-auto"
              >
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  {t("ctaPrimary")}
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full bg-transparent sm:w-auto"
              >
                <a href="#products">{t("ctaSecondary")}</a>
              </Button>
            </div>
          </div>

          {/* Foto y tarjeta */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Foto principal */}
              <div className="relative h-80 w-80 overflow-hidden rounded-3xl border-4 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 shadow-xl sm:h-96 sm:w-96">
                <Avatar className="h-full w-full rounded-none">
                  <AvatarImage
                    src="/profile.png"                    
                    alt="Foto de perfil"
                    className="h-full w-full object-cover"
                  />
                  <AvatarFallback className="h-full w-full rounded-none bg-gradient-to-br from-primary/10 to-primary/20 text-6xl text-primary">
                    TU
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Badge flotante */}
              <div className="absolute -bottom-4 -right-4 rounded-2xl border border-border bg-card p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">WhatsApp</p>
                    <p className="text-xs text-muted-foreground">Disponible ahora</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
              <Users className="h-6 w-6 text-secondary" />
            </div>
            <p className="text-3xl font-bold text-foreground">{t("stats.clientsValue")}</p>
            <p className="text-sm text-muted-foreground">{t("stats.clients")}</p>
          </div>

          <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
              <Clock className="h-6 w-6 text-secondary" />
            </div>
            <p className="text-3xl font-bold text-foreground">{t("stats.experienceValue")}</p>
            <p className="text-sm text-muted-foreground">{t("stats.experience")}</p>
          </div>

          <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
              <Package className="h-6 w-6 text-secondary" />
            </div>
            <p className="text-3xl font-bold text-foreground">{t("stats.productsValue")}</p>
            <p className="text-sm text-muted-foreground">{t("stats.products")}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
