import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageCircle, Users, Clock, Package } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { getAdvisorSettings } from "@/lib/actions/settings"
import type { AdvisorSettings } from "@/lib/actions/settings"

function initials(name: string) {
  const parts = name.trim().split(" ")
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

export async function Hero() {
  const t = await getTranslations("landing.hero")
  const settings: AdvisorSettings | null = await getAdvisorSettings()

  const name = settings?.display_name ?? t("name")
  const roleTitle = settings?.role_title ?? t("role")
  const photoUrl = settings?.photo_url ?? null
  const whatsapp = (settings?.whatsapp ?? "+595986259004").replace(/[^0-9]/g, "")
  const message = encodeURIComponent(settings?.whatsapp_message ?? "Hola! Me interesa conocer más sobre los productos Teralife.")
  const whatsappLink = `https://wa.me/${whatsapp}?text=${message}`

  const statClients = settings?.stat_clients ?? t("stats.clientsValue")
  const statExp = settings?.stat_experience ?? t("stats.experienceValue")
  const statProducts = settings?.stat_products ?? t("stats.productsValue")

  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-1/4 -top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Text */}
          <div className="text-center lg:text-left">
            <p className="text-lg font-medium text-primary">{t("greeting")}</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {name}
            </h1>
            <p className="mt-2 text-xl font-medium text-muted-foreground">{roleTitle}</p>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-muted-foreground lg:mx-0">
              {settings?.bio ?? t("description")}
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              <Button size="lg" asChild className="w-full bg-primary hover:bg-primary/90 sm:w-auto">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  {t("ctaPrimary")}
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full bg-transparent sm:w-auto">
                <a href="#products">{t("ctaSecondary")}</a>
              </Button>
            </div>
          </div>

          {/* Photo */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="relative h-80 w-80 overflow-hidden rounded-3xl border-4 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 shadow-xl sm:h-96 sm:w-96">
                <Avatar className="h-full w-full rounded-none">
                  <AvatarImage
                    src={photoUrl ?? "/profile.png"}
                    alt={`Foto de ${name}`}
                    className="h-full w-full object-cover"
                  />
                  <AvatarFallback className="h-full w-full rounded-none bg-gradient-to-br from-primary/10 to-primary/20 text-6xl text-primary">
                    {initials(name)}
                  </AvatarFallback>
                </Avatar>
              </div>
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

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { icon: Users, value: statClients, label: t("stats.clients") },
            { icon: Clock, value: statExp, label: t("stats.experience") },
            { icon: Package, value: statProducts, label: t("stats.products") },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                <Icon className="h-6 w-6 text-secondary" />
              </div>
              <p className="text-3xl font-bold text-foreground">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
