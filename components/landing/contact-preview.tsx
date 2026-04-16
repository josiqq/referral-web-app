"use client"

import { MessageCircle, Phone, MapPin, ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"

export function ContactPreview() {
  const t = useTranslations("landing.contact")

  const whatsappNumber = "+595986259004"
  const whatsappMessage = encodeURIComponent("Hola! Me interesa conocer más sobre los productos Teralife.")
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${whatsappMessage}`

  return (
    <section id="contact" className="border-t border-border bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        {/* 3 highlights */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">WhatsApp</h3>
            <p className="mt-1 text-sm text-muted-foreground">{whatsappNumber}</p>
          </div>

          <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
              <Phone className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="font-semibold text-foreground">{t("info.hours")}</h3>
            <p className="mt-1 text-sm text-muted-foreground whitespace-pre-line">
              {t("info.hoursValue")}
            </p>
          </div>

          <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
              <MapPin className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="font-semibold text-foreground">{t("info.location")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">Paraguay</p>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-5 w-5" />
              {t("whatsappButton")}
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-transparent">
            <Link href="/contacto">
              Ver más formas de contacto
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
