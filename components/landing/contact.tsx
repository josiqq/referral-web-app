"use client"

import { MessageCircle, Phone, Mail, MapPin, Clock } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function Contact() {
  const t = useTranslations("landing.contact")

  const whatsappNumber = "+595986259004" // Cambiar por tu número
  const whatsappMessage = encodeURIComponent("Hola! Me interesa conocer más sobre los productos Teralife.")
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`

  const contactInfo = [
    {
      icon: Phone,
      label: t("info.phone"),
      value: whatsappNumber,
    },
    {
      icon: Mail,
      label: t("info.email"),
      value: "tu@email.com", // Cambiar por tu email
    },
    {
      icon: MapPin,
      label: t("info.location"),
      value: "Tu Ciudad, País", // Cambiar por tu ubicación
    },
    {
      icon: Clock,
      label: t("info.hours"),
      value: t("info.hoursValue"),
    },
  ]

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

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {/* Información de contacto */}
          <div>
            <p className="text-muted-foreground leading-relaxed">
              {t("description")}
            </p>

            <div className="mt-8 space-y-4">
              {contactInfo.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary/10">
                    <item.icon className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              asChild
              className="mt-8 w-full bg-primary hover:bg-primary/90"
            >
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-5 w-5" />
                {t("whatsappButton")}
              </a>
            </Button>
          </div>

          {/* CTA Card */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">
                {t("form.title")}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                La mejor forma de contactarme es por WhatsApp. Respondo en menos de 24 horas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-primary/20 bg-card p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">WhatsApp Directo</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Haz clic en el botón para iniciar una conversación conmigo y resolver todas tus dudas.
                </p>
                <Button
                  asChild
                  className="mt-4 bg-primary hover:bg-primary/90"
                >
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Iniciar Chat
                  </a>
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>Horario de respuesta:</p>
                <p className="font-medium">{t("info.hoursValue").split('\n')[0]}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
