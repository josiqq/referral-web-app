"use client"

import { Link } from "@/i18n/routing"
import { Leaf, Heart, MessageCircle } from "lucide-react"
import { useTranslations } from "next-intl"

export function Footer() {
  const t = useTranslations("landing.footer")
  const tCommon = useTranslations("common")

  const whatsappNumber = "+1234567890"
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">{tCommon("brandName")}</span>
            </Link>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              {t("description")}
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">{t("quickLinks")}</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="#about" className="text-sm text-muted-foreground hover:text-foreground">
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link href="#products" className="text-sm text-muted-foreground hover:text-foreground">
                  {t("products")}
                </Link>
              </li>
              <li>
                <Link href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground">
                  {t("testimonials")}
                </Link>
              </li>
              <li>
                <Link href="#contact" className="text-sm text-muted-foreground hover:text-foreground">
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">{t("legal")}</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                  {t("terms")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 rounded-lg bg-muted/50 p-4">
          <p className="text-xs text-muted-foreground">
            <strong>{t("disclaimer")}:</strong> {t("disclaimerText")}
          </p>
        </div>

        <div className="mt-8 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {tCommon("brandName")}. {t("copyright")}
          </p>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {t("madeWith")} <Heart className="inline h-3 w-3 text-red-500" /> {t("forYourHealth")}
          </p>
        </div>
      </div>
    </footer>
  )
}
