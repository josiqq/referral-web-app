import { getAdvisorSettings } from "@/lib/actions/settings"
import { getSponsors } from "@/lib/actions/sponsors"
import { ExternalLink } from "lucide-react"

export async function Sponsors() {
  const [settings, sponsors] = await Promise.all([
    getAdvisorSettings(),
    getSponsors(true),
  ])

  // No renderizar si está desactivado
  if (!settings?.sponsors_enabled) return null

  const title = settings.sponsors_title ?? "Nuestros Patrocinadores"
  const subtitle = settings.sponsors_subtitle ?? ""

  return (
    <section
      id="sponsors"
      className="border-t border-border bg-muted/20 px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {sponsors.length === 0 ? (
          // Estado vacío — solo visible si la sección está activa pero sin sponsors cargados
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Próximamente anunciaremos nuestros patrocinadores.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {sponsors.map((sponsor) => {
              const card = (
                <div
                  key={sponsor.id}
                  className={`group relative flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6
                    transition-all hover:border-primary/30 hover:shadow-md
                    ${sponsor.website_url ? "cursor-pointer" : ""}
                    w-40 sm:w-44`}
                >
                  {/* Logo */}
                  <div className="h-16 w-full flex items-center justify-center">
                    {sponsor.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={sponsor.logo_url}
                        alt={`Logo de ${sponsor.name}`}
                        className="max-h-14 max-w-full object-contain grayscale group-hover:grayscale-0 transition-all"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">
                          {sponsor.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Nombre */}
                  <p className="text-sm font-semibold text-foreground text-center leading-tight">
                    {sponsor.name}
                  </p>

                  {/* Descripción opcional */}
                  {sponsor.description && (
                    <p className="text-xs text-muted-foreground text-center leading-snug">
                      {sponsor.description}
                    </p>
                  )}

                  {/* Ícono de link externo */}
                  {sponsor.website_url && (
                    <ExternalLink className="absolute top-3 right-3 w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  )}
                </div>
              )

              return sponsor.website_url ? (
                <a
                  key={sponsor.id}
                  href={sponsor.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visitar ${sponsor.name}`}
                >
                  {card}
                </a>
              ) : (
                <div key={sponsor.id}>{card}</div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
