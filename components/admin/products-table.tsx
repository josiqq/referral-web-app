"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Product, ProductCategory } from "@/lib/actions/products"
import { deleteProduct, updateProduct } from "@/lib/actions/products"
import { Pencil, Trash2, Eye, EyeOff, Search } from "lucide-react"
import Link from "next/link"

interface ProductsTableProps {
  products: Product[]
  categories: ProductCategory[]
}

export function ProductsTable({ products, categories }: ProductsTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar el producto "${name}"? Esta acción no se puede deshacer.`)) return
    setDeletingId(id)
    await deleteProduct(id)
    setDeletingId(null)
    router.refresh()
  }

  const handleToggleActive = async (product: Product) => {
    setTogglingId(product.id)
    await updateProduct({ id: product.id, is_active: !product.is_active })
    setTogglingId(null)
    router.refresh()
  }

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return <span className="text-xs text-muted-foreground/50">Sin categoría</span>
    const cat = categories.find((c) => c.id === categoryId)
    return cat ? (
      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{cat.name}</span>
    ) : null
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Search bar */}
      <div className="border-b border-border p-4">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-muted/40 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Producto</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Categoría</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Precio</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Imágenes</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No se encontraron productos.
                </td>
              </tr>
            ) : (
              filtered.map((product) => {
                const primaryImage = product.images?.find((i) => i.is_primary)?.image_url
                return (
                  <tr key={product.id} className="transition-colors hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {primaryImage ? (
                            <img src={primaryImage} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground/40">IMG</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground">/{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getCategoryName(product.category_id)}</td>
                    <td className="px-4 py-3 text-foreground">
                      {product.price != null ? `$${product.price.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(product)}
                        disabled={togglingId === product.id}
                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                          product.is_active
                            ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {product.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {product.is_active ? "Activo" : "Inactivo"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{product.images?.length ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/productos/${product.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={deletingId === product.id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
