import { Heart, HandHeart, BookOpen, type LucideIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAdvisorSettings } from "@/lib/actions/settings"
import { getTranslations } from "next-intl/server"

const ICON_MAP: Record<string, LucideIcon> = {
  Heart,
  HandHeart,
  BookOpen,
}

export async function About() {
  const t = await getTranslations("landing.about")
  const settings = await getAdvisorSettings()

  const title = settings?.about_title ?? t("title")
  const subtitle = settings?.about_subtitle ?? t("subtitle")
  const bio = settings?.about_bio ?? t("bio")
  const mission = settings?.about_mission ?? t("mission")
  const photoUrl = settings?.about_photo_url ?? null

  const values = settings?.about_values ?? [
    { icon: "Heart", title: t("values.honesty.title"), description: t("values.honesty.description") },
    { icon: "HandHeart", title: t("values.commitment.title"), description: t("values.commitment.description") },
    { icon: "BookOpen", title: t("values.knowledge.title"), description: t("values.knowledge.description") },
  ]

  return (
    <section id="about" className="border-t border-border bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Imagen */}
          <div className="flex justify-center lg:order-2">
            <div className="relative">
              <div className="h-80 w-80 overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 to-primary/10 shadow-xl sm:h-96 sm:w-96">
                <Avatar className="h-full w-full rounded-none">
                  <AvatarImage
                    src={photoUrl ?? "/images/about.jpg"}
                    alt="Sobre mí"
                    className="h-full w-full object-cover"
                  />
                  <AvatarFallback className="h-full w-full rounded-none bg-gradient-to-br from-primary/10 to-primary/20 text-6xl text-primary">
                    TL
                  </AvatarFallback>
                </Avatar>
              </div>
              {/* Decoración */}
              <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-2xl bg-primary/10" />
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-2xl bg-primary/10" />
            </div>
          </div>

          {/* Contenido */}
          <div className="lg:order-1">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              {subtitle}
            </p>

            <p className="mt-6 text-muted-foreground leading-relaxed">
              {bio}
            </p>

            <p className="mt-4 text-muted-foreground leading-relaxed">
              {mission}
            </p>

            {/* Valores */}
            {values.length > 0 && (
              <div className="mt-10">
                <h3 className="text-lg font-semibold text-foreground">{t("values.title")}</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {values.map((value, i) => {
                    const Icon = ICON_MAP[value.icon] ?? Heart
                    return (
                      <div
                        key={i}
                        className="rounded-xl border border-border bg-card p-4"
                      >
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                          <Icon className="h-5 w-5 text-secondary" />
                        </div>
                        <h4 className="font-medium text-foreground">{value.title}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">{value.description}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
