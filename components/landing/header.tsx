"use client"

import { useState } from "react"
import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Leaf, Menu, X, LayoutDashboard, ShieldCheck, LogOut } from "lucide-react"
import { useTranslations } from "next-intl"
import { LanguageSwitcher } from "@/components/language-switcher"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "@/i18n/routing"

type UserInfo = {
  isLoggedIn: boolean
  isAdmin: boolean
  displayName: string | null
} | null

export function Header({ userInfo }: { userInfo: UserInfo }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const t = useTranslations("landing.header")
  const tCommon = useTranslations("common")
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
    router.push("/")
  }

  const navLinks = [
    { href: "/#about", label: t("about") },
    { href: "/productos", label: t("products") },
    { href: "/#benefits", label: t("benefits") },
    { href: "/#testimonials", label: t("testimonials") },
    { href: "/contacto", label: t("contact") },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">{tCommon("brandName")}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right side */}
        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />

          {userInfo?.isLoggedIn ? (
            <>
              {userInfo.isAdmin && (
                <Button variant="ghost" size="sm" asChild className="gap-1.5">
                  <Link href="/admin">
                    <ShieldCheck className="h-4 w-4" />
                    Admin
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" asChild className="gap-1.5">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  {userInfo.displayName ?? "Mi panel"}
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5 bg-transparent"
              >
                <LogOut className="h-4 w-4" />
                Salir
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/login">{t("logIn")}</Link>
              </Button>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/auth/sign-up">{t("getStarted")}</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen
              ? <X className="h-6 w-6 text-foreground" />
              : <Menu className="h-6 w-6 text-foreground" />
            }
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="flex flex-col gap-4 px-4 py-4">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              {userInfo?.isLoggedIn ? (
                <>
                  {userInfo.isAdmin && (
                    <Button variant="outline" asChild className="w-full gap-1.5 bg-transparent">
                      <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                        <ShieldCheck className="h-4 w-4" /> Admin
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" asChild className="w-full gap-1.5 bg-transparent">
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <LayoutDashboard className="h-4 w-4" />
                      {userInfo.displayName ?? "Mi panel"}
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full gap-1.5 text-muted-foreground"
                    onClick={() => { setMobileMenuOpen(false); handleLogout() }}
                  >
                    <LogOut className="h-4 w-4" /> Salir
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                      {t("logIn")}
                    </Link>
                  </Button>
                  <Button asChild className="w-full bg-primary hover:bg-primary/90">
                    <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>
                      {t("getStarted")}
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
