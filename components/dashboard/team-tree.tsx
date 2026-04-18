"use client"

import { useMemo, useState } from "react"
import { Crown, Users, Calendar, ChevronDown, ChevronRight, TrendingUp, Network } from "lucide-react"

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
    if (n.referred_by === rootId) roots.push(map[n.id])
    else if (map[n.referred_by!]) map[n.referred_by!].children.push(map[n.id])
  }
  return roots
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-PY", { day: "2-digit", month: "short", year: "numeric" })
}

function initials(name: string | null, email: string) {
  if (name) {
    const parts = name.trim().split(" ")
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

const DEPTH_COLORS = [
  { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  { bg: "bg-secondary/10", text: "text-secondary", border: "border-secondary/20" },
  { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/20" },
  { bg: "bg-violet-500/10", text: "text-violet-600", border: "border-violet-500/20" },
  { bg: "bg-orange-500/10", text: "text-orange-600", border: "border-orange-500/20" },
]

function getColor(depth: number) {
  if (depth < 0) return DEPTH_COLORS[0]
  return DEPTH_COLORS[depth % DEPTH_COLORS.length]
}

function Avatar({
  name,
  email,
  size = "md",
  depth = 0,
}: {
  name: string | null
  email: string
  size?: "sm" | "md" | "lg"
  depth?: number
}) {
  const c = getColor(depth)
  const sz =
    size === "lg"
      ? "w-12 h-12 text-base"
      : size === "sm"
      ? "w-8 h-8 text-xs"
      : "w-10 h-10 text-sm"
  return (
    <div
      className={`${sz} rounded-full ${c.bg} ${c.text} flex items-center justify-center font-bold shrink-0`}
    >
      {initials(name, email)}
    </div>
  )
}

function UplineSection({ upline }: { upline: UplineNode[] }) {
  const [expanded, setExpanded] = useState(false)
  if (upline.length === 0) return null
  const shown = expanded ? upline : upline.slice(0, 2)

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Crown className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Tu upline
        </span>
        <span className="text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">
          {upline.length}
        </span>
      </div>
      <div className="space-y-2">
        {shown.map((u, i) => (
          <div
            key={u.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/60 hover:border-primary/20 transition-colors"
          >
            <Avatar name={u.display_name} email={u.email} size="sm" depth={i} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {u.display_name ?? u.email}
              </p>
              {u.display_name && (
                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
              )}
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              Nivel {upline.length - i}&uarr;
            </span>
          </div>
        ))}
      </div>
      {upline.length > 2 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 w-full text-xs text-primary hover:text-primary/80 font-medium flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
        >
          {expanded ? (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              Ver menos
            </>
          ) : (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              Ver {upline.length - 2} más
            </>
          )}
        </button>
      )}
    </div>
  )
}

function DownlineRow({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 2)
  const hasChildren = node.children.length > 0
  const c = getColor(depth)

  return (
    <div>
      <div
        className={`flex items-center gap-3 p-3 rounded-xl border transition-all
          ${hasChildren ? "cursor-pointer" : "cursor-default"}
          ${c.border} bg-card hover:shadow-sm`}
        onClick={() => hasChildren && setOpen((v) => !v)}
      >
        <Avatar name={node.display_name} email={node.email} size="sm" depth={depth} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate leading-tight">
            {node.display_name ?? node.email}
          </p>
          {node.display_name && (
            <p className="text-xs text-muted-foreground truncate">{node.email}</p>
          )}
          <div className="flex items-center gap-1 mt-0.5">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{formatDate(node.created_at)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hasChildren && (
            <span
              className={`flex items-center gap-1 text-xs font-medium ${c.bg} ${c.text} px-2 py-0.5 rounded-full`}
            >
              <Users className="w-3 h-3" />
              {node.children.length}
            </span>
          )}
          {hasChildren && (
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground/60 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          )}
        </div>
      </div>

      {hasChildren && open && (
        <div className="ml-4 mt-1 pl-3 border-l-2 border-border/50 space-y-1.5">
          {node.children.map((child) => (
            <DownlineRow key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

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
    <div className="grid grid-cols-3 gap-3 mb-6">
      {[
        {
          label: "Tu upline",
          value: uplineCount,
          Icon: Crown,
          color: "text-primary",
          bg: "bg-primary/5 border-primary/10",
        },
        {
          label: "Directos",
          value: directCount,
          Icon: TrendingUp,
          color: "text-secondary",
          bg: "bg-secondary/5 border-secondary/10",
        },
        {
          label: "Total red",
          value: totalCount,
          Icon: Network,
          color: "text-foreground",
          bg: "bg-muted border-border",
        },
      ].map(({ label, value, Icon, color, bg }) => (
        <div key={label} className={`rounded-xl border p-3 md:p-4 text-center ${bg}`}>
          <Icon className={`w-4 h-4 ${color} mx-auto mb-1 opacity-70`} />
          <p className={`text-xl md:text-2xl font-bold ${color}`}>{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  )
}

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
  const directCount = downlineFlat.filter((n) => n.referred_by === me.id).length

  return (
    <div>
      <StatsBar
        uplineCount={upline.length}
        directCount={directCount}
        totalCount={downlineFlat.length}
      />

      <UplineSection upline={upline} />

      {/* Me card */}
      <div className="relative flex items-center gap-4 p-4 rounded-2xl border-2 border-primary bg-primary/5 shadow-sm mb-4">
        <div className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-0.5 rounded-full">
          Tú
        </div>
        <Avatar name={me.display_name} email={me.email} size="lg" depth={-1} />
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground leading-tight">
            {me.display_name ?? me.email}
          </p>
          {me.display_name && (
            <p className="text-xs text-muted-foreground">{me.email}</p>
          )}
          <p className="text-xs text-primary font-medium mt-0.5">Cabeza de tu red</p>
        </div>
        {directCount > 0 && (
          <span className="ml-auto shrink-0 text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
            {directCount} directo{directCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Downline */}
      {downlineTree.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <Users className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Tu red está vacía por ahora</p>
          <p className="text-xs text-muted-foreground/70 max-w-xs">
            Cuando alguien se registre con un código asignado a ti, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-secondary" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Tu equipo
            </span>
            <span className="text-xs bg-secondary/10 text-secondary font-medium px-2 py-0.5 rounded-full">
              {downlineFlat.length}
            </span>
          </div>
          <div className="space-y-1.5">
            {downlineTree.map((child) => (
              <DownlineRow key={child.id} node={child} depth={0} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
