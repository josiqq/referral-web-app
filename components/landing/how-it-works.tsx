"use client"

import { UserPlus, Share2, Gift } from "lucide-react"
import { useTranslations } from "next-intl"

export function HowItWorks() {
  const t = useTranslations("landing.howItWorks")

  const steps = [
    {
      icon: UserPlus,
      key: "signUp",
    },
    {
      icon: Share2,
      key: "share",
    },
    {
      icon: Gift,
      key: "earn",
    },
  ]

  return (
    <section id="how-it-works" className="border-t border-border bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.key} className="relative">
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-12 hidden h-0.5 w-full -translate-y-1/2 bg-border lg:block" />
              )}
              <div className="relative flex flex-col items-center text-center">
                <div className="relative z-10 mb-4 flex h-24 w-24 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <step.icon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="mt-2 text-xl font-semibold text-foreground">
                  {t(`steps.${step.key}.title`)}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {t(`steps.${step.key}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
