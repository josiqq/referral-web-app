"use client"

import { useMemo } from "react"
import { Crown, User, ChevronDown, Users, Calendar } from "lucide-react"

type FlatNode = {
  id: string
  display_name: string | null
  email: string
  referred_by: string | null
  depth: number
  created_at: string
}

type TreeNode = FlatNode & { children: TreeNode[] }

type MeNode = {
  id: string
  display_name: string | null
  email: string
  referred_by: string | null
}

type UplineNode = {
  id: string
  display_name: string | null
  email: string
}

function buildTree(flat: FlatNode[], rootId: string): TreeNode[] {
  const map: Record<string, TreeNode> = {}
  for (const n of flat) map[n.id] = { ...n, children: [] }

  const roots: TreeNode[] = []
  for (const n of flat) {
    if (n.referred_by === rootId) {
      roots.push(map[n.id])
    } else if (map[n.referred_by!]) {
      map[n.referred_by!].children.push(map[n.id])
    }
  }
  return roots
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-PY", { day: "2-digit", month: "short", year: "numeric" })
}

function initials(name: string | null, email: string) {
  if (name) {
    const parts = name.trim().split(" ")
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

// ── Upline card (greyed, above the user) ────────────────────────────────────
function UplineCard({ node, index, total }: { node: UplineNode; index: number; total: number }) {
  const isTop = index === 0
  return (
    <div className="flex flex-col items-center">
      <div className={`
        relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
        ${isTop
          ? "bg-amber-50 border-amber-200 shadow-sm"
          : "bg-gray-50 border-gray-200"}
      `}>
        {isTop && (
          <Crown className="absolute -top-2.5 -right-2.5 w-4 h-4 text-amber-500" />
        )}
        <div className={`
          w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0
          ${isTop ? "bg-amber-100 text-amber-700" : "bg-gray-200 text-gray-600"}
        `}>
          {initials(node.display_name, node.email)}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800 leading-tight">
            {node.display_name ?? node.email}
          </p>
          {node.display_name && (
            <p className="text-xs text-gray-400">{node.email}</p>
          )}
          <p className="text-xs text-gray-400 mt-0.5">
            Nivel {total - index} arriba
          </p>
        </div>
      </div>
      {/* Connector down */}
      <div className="w-px h-6 bg-gray-300" />
    </div>
  )
}

// ── "Me" card — always the root of the visible tree ─────────────────────────
function MeCard({ me }: { me: MeNode }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center gap-3 px-5 py-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50 shadow-md">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-3 py-0.5 rounded-full">
          Tú
        </div>
        <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center text-base font-bold shrink-0">
          {initials(me.display_name, me.email)}
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">
            {me.display_name ?? me.email}
          </p>
          {me.display_name && (
            <p className="text-xs text-gray-500">{me.email}</p>
          )}
          <p className="text-xs text-emerald-600 font-medium mt-0.5">Cabeza de tu red</p>
        </div>
      </div>
    </div>
  )
}

// ── Recursive downline node ──────────────────────────────────────────────────
function DownlineNode({ node, isLast }: { node: TreeNode; isLast: boolean }) {
  const hasChildren = node.children.length > 0

  return (
    <div className="flex flex-col items-center">
      {/* Connector from parent */}
      <div className="w-px h-6 bg-gray-300" />

      <div className="flex flex-col items-center">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm hover:border-emerald-300 hover:shadow-md transition-all">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold shrink-0">
            {initials(node.display_name, node.email)}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 leading-tight">
              {node.display_name ?? node.email}
            </p>
            {node.display_name && (
              <p className="text-xs text-gray-400">{node.email}</p>
            )}
            <div className="flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400">{formatDate(node.created_at)}</span>
            </div>
          </div>
          {hasChildren && (
            <div className="ml-2 flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
              <Users className="w-3 h-3" />
              {node.children.length}
            </div>
          )}
        </div>

        {/* Children */}
        {hasChildren && (
          <div className="flex flex-col items-center w-full">
            {/* Horizontal bar connecting children */}
            {node.children.length > 1 ? (
              <div className="flex flex-col items-center w-full">
                <div className="w-px h-4 bg-gray-300" />
                <div className="relative flex items-start justify-center gap-4">
                  {node.children.map((child, i) => (
                    <div key={child.id} className="flex flex-col items-center">
                      <DownlineNode node={child} isLast={i === node.children.length - 1} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              node.children.map((child, i) => (
                <DownlineNode key={child.id} node={child} isLast={i === node.children.length - 1} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Stats bar ────────────────────────────────────────────────────────────────
function StatsBar({
  uplineCount,
  directCount,
  totalCount,
}: {
  uplineCount: number
  directCount: number
  totalCount: number
}) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {[
        { label: "Tu upline", value: uplineCount, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
        { label: "Directos", value: directCount, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
        { label: "Total red", value: totalCount, color: "text-teal-600", bg: "bg-teal-50 border-teal-100" },
      ].map(stat => (
        <div key={stat.label} className={`rounded-xl border p-4 text-center ${stat.bg}`}>
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}

// ── Main export ──────────────────────────────────────────────────────────────
export default function TeamTree({
  upline,
  me,
  downlineFlat,
}: {
  upline: UplineNode[]
  me: MeNode
  downlineFlat: FlatNode[]
}) {
  const downlineTree = useMemo(() => buildTree(downlineFlat, me.id), [downlineFlat, me.id])

  const directCount = downlineFlat.filter(n => n.referred_by === me.id).length
  const totalCount = downlineFlat.length

  return (
    <div>
      <StatsBar
        uplineCount={upline.length}
        directCount={directCount}
        totalCount={totalCount}
      />

      {/* Tree container with horizontal scroll */}
      <div className="overflow-x-auto pb-6">
        <div className="flex flex-col items-center min-w-max mx-auto">

          {/* Upline chain */}
          {upline.length > 0 && (
            <div className="flex flex-col items-center mb-0">
              {upline.map((u, i) => (
                <UplineCard key={u.id} node={u} index={i} total={upline.length} />
              ))}
            </div>
          )}

          {/* Me */}
          <MeCard me={me} />

          {/* Downline */}
          {downlineTree.length === 0 ? (
            <div className="flex flex-col items-center mt-8 text-center">
              <div className="w-px h-6 bg-gray-300" />
              <div className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 max-w-xs">
                <Users className="w-8 h-8 text-gray-300" />
                <p className="text-sm text-gray-500 font-medium">Tu red está vacía por ahora</p>
                <p className="text-xs text-gray-400">
                  Cuando alguien se registre con un código asignado a ti, aparecerá aquí.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {downlineTree.length === 1 ? (
                <DownlineNode node={downlineTree[0]} isLast={true} />
              ) : (
                <div className="flex flex-col items-center w-full">
                  <div className="w-px h-4 bg-gray-300" />
                  <div className="flex items-start justify-center gap-6 flex-wrap">
                    {downlineTree.map((child, i) => (
                      <div key={child.id} className="flex flex-col items-center">
                        <DownlineNode node={child} isLast={i === downlineTree.length - 1} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
