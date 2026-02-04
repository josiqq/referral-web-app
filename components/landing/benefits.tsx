"use client"

import { Atom, Leaf, Award, UserCheck, BadgeCheck, HeartHandshake } from "lucide-react"
import { useTranslations } from "next-intl"

export function Benefits() {
  const t = useTranslations("landing.benefits")

  const benefits = [
    { icon: Atom, key: "nanotechnology" },
    { icon: Leaf, key: "natural" },
    { icon: Award, key: "results" },
    { icon: UserCheck, key: "personalized" },
    { icon: BadgeCheck, key: "certified" },
    { icon: HeartHandshake, key: "support" },
  ]

  return (
    <section id="benefits" className="border-t border-border bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.key}
              className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 transition-colors group-hover:bg-secondary/20">
                <benefit.icon className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                {t(`items.${benefit.key}.title`)}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {t(`items.${benefit.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
