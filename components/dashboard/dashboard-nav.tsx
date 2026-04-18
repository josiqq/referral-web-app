"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Leaf, Users, Package, Tag, KeyRound,
  Settings, ChevronRight, Menu, X, UserCircle2,
} from "lucide-react"
import LogoutButton from "@/components/dashboard/logout-button"
import { useState } from "react"

type NavItem = {
  href: string
  label: string
  icon: React.ElementType
  exact?: boolean
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Mi Equipo", icon: Users, exact: true },
  { href: "/dashboard/productos", label: "Productos", icon: Package, adminOnly: true },
  { href: "/dashboard/categorias", label: "Categorías", icon: Tag, adminOnly: true },
  { href: "/dashboard/codigos", label: "Códigos", icon: KeyRound, adminOnly: true },
  { href: "/dashboard/about", label: "Sobre Mí", icon: UserCircle2, adminOnly: true },
  { href: "/dashboard/configuracion", label: "Configuración", icon: Settings, adminOnly: true },
]

type Props = {
  locale: string
  isAdmin: boolean
  displayName: string | null
  email: string
}

export default function DashboardNav({ locale, isAdmin, displayName, email }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(href: string, exact?: boolean) {
    const localizedHref = locale === "es" ? href : `/${locale}${href}`
    return exact ? pathname === localizedHref : pathname.startsWith(localizedHref)
  }

  const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin)

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 mb-8 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Leaf className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground leading-tight">Teralife</p>
          <p className="text-xs text-muted-foreground truncate">{isAdmin ? "Admin" : "Panel"}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {visibleItems.map(({ href, label, icon: Icon, exact, adminOnly }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {adminOnly && !active && (
                <span className="text-[10px] font-semibold bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full leading-none">
                  Admin
                </span>
              )}
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto shrink-0" />}
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="px-4 pt-4 border-t border-border space-y-3">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
            {(displayName ?? email).slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{displayName ?? email}</p>
            {displayName && <p className="text-[11px] text-muted-foreground truncate">{email}</p>}
          </div>
        </div>
        <LogoutButton />
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 fixed top-0 left-0 h-screen border-r border-border bg-card py-6 z-20">
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-card border-b border-border h-12 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Leaf className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold text-foreground">Teralife</span>
        </div>
        <button onClick={() => setMobileOpen(v => !v)} className="p-1 text-muted-foreground">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-20" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/20" />
          <aside
            className="absolute top-12 left-0 bottom-0 w-64 bg-card border-r border-border flex flex-col py-6"
            onClick={e => e.stopPropagation()}
          >
            <NavContent />
          </aside>
        </div>
      )}
    </>
  )
}
