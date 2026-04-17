"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Leaf, LayoutDashboard, Package, Tag, KeyRound, Settings, ChevronRight } from "lucide-react"
import LogoutButton from "@/components/dashboard/logout-button"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/categorias", label: "Categorías", icon: Tag },
  { href: "/admin/codigos", label: "Códigos", icon: KeyRound },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
]

export default function AdminNav({ locale }: { locale: string }) {
  const pathname = usePathname()

  function isActive(href: string, exact?: boolean) {
    const localizedHref = locale === "es" ? href : `/${locale}${href}`
    return exact ? pathname === localizedHref : pathname.startsWith(localizedHref)
  }

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-gray-100 bg-white min-h-screen py-6">
      {/* Logo */}
      <div className="px-5 mb-8 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
          <Leaf className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">Teralife</p>
          <p className="text-xs text-gray-400">Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-5 pt-4 border-t border-gray-100">
        <LogoutButton />
      </div>
    </aside>
  )
}
