"use client"

import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Leaf, Menu, X } from "lucide-react"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { LanguageSwitcher } from "@/components/language-switcher"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const t = useTranslations("landing.header")
  const tCommon = useTranslations("common")

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">{tCommon("brandName")}</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/#about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            {t("about")}
          </Link>
          <Link href="/productos" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            {t("products")}
          </Link>
          <Link href="/#benefits" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            {t("benefits")}
          </Link>
          <Link href="/#testimonials" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            {t("testimonials")}
          </Link>
          <Link href="/contacto" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            {t("contact")}
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <Button variant="ghost" asChild>
            <Link href="/auth/login">{t("logIn")}</Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/auth/sign-up">{t("getStarted")}</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="flex flex-col gap-4 px-4 py-4">
            <Link
              href="/#about"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("about")}
            </Link>
            <Link
              href="/productos"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("products")}
            </Link>
            <Link
              href="/#benefits"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("benefits")}
            </Link>
            <Link
              href="/#testimonials"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("testimonials")}
            </Link>
            <Link
              href="/contacto"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("contact")}
            </Link>
            <div className="flex flex-col gap-2 pt-4">
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/auth/login">{t("logIn")}</Link>
              </Button>
              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <Link href="/auth/sign-up">{t("getStarted")}</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
