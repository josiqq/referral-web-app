"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, User, Crown, Users } from "lucide-react"

type FlatNode = {
  id: string
  display_name: string | null
  email: string
  referred_by: string | null
  depth: number
  created_at: string
}

type TreeNode = FlatNode & { children: TreeNode[] }

function buildTree(nodes: FlatNode[], rootId: string): TreeNode[] {
  const map = new Map<string, TreeNode>()
  for (const n of nodes) {
    map.set(n.id, { ...n, children: [] })
  }
  const roots: TreeNode[] = []
  for (const n of map.values()) {
    if (n.referred_by === rootId) {
      roots.push(n)
    } else if (n.referred_by && map.has(n.referred_by)) {
      map.get(n.referred_by)!.children.push(n)
    }
  }
  return roots
}

function NodeCard({
  node,
  isMe = false,
  isUpline = false,
  level = 0,
}: {
  node: TreeNode | { id: string; display_name: string | null; email: string; children?: TreeNode[] }
  isMe?: boolean
  isUpline?: boolean
  level?: number
}) {
  const [expanded, setExpanded] = useState(true)
  const children = "children" in node ? node.children ?? [] : []
  const hasChildren = children.length > 0

  const initials = node.display_name
    ? node.display_name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : node.email[0].toUpperCase()

  return (
    <div className="flex flex-col items-center">
      {/* Card */}
      <div
        className={`
          relative flex items-center gap-3 px-4 py-3 rounded-xl border shadow-sm min-w-[200px] max-w-[240px]
          transition-all select-none
          ${isMe
            ? "bg-emerald-600 border-emerald-700 text-white shadow-emerald-200 shadow-md"
            : isUpline
            ? "bg-amber-50 border-amber-200 text-amber-900"
            : "bg-white border-gray-200 text-gray-800 hover:border-emerald-300 hover:shadow"
          }
        `}
      >
        {/* Avatar */}
        <div
          className={`
            w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0
            ${isMe ? "bg-emerald-500 text-white" : isUpline ? "bg-amber-200 text-amber-800" : "bg-emerald-100 text-emerald-700"}
          `}
        >
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate ${isMe ? "text-white" : ""}`}>
            {node.display_name ?? "Sin nombre"}
          </p>
          <p className={`text-xs truncate ${isMe ? "text-emerald-100" : "text-gray-400"}`}>
            {node.email}
          </p>
        </div>

        {/* Badge */}
        {isMe && (
          <span className="absolute -top-2 -right-2 bg-white text-emerald-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-200 shadow-sm">
            Tú
          </span>
        )}
        {isUpline && (
          <Crown className="w-4 h-4 text-amber-500 shrink-0" />
        )}

        {/* Expand toggle */}
        {hasChildren && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border flex items-center justify-center z-10 transition-colors
              ${isMe ? "bg-emerald-700 border-emerald-500 text-white" : "bg-white border-gray-300 text-gray-500 hover:border-emerald-400 hover:text-emerald-600"}
            `}
          >
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="mt-6 flex flex-col items-center w-full">
          {/* Vertical connector from parent */}
          <div className="w-px h-4 bg-gray-200" />

          {children.length === 1 ? (
            <NodeCard node={children[0]} level={level + 1} />
          ) : (
            <div className="flex flex-col items-center w-full">
              {/* Horizontal line spanning all children */}
              <div className="relative flex items-start justify-center w-full">
                {/* Horizontal bar */}
                <div
                  className="absolute top-0 h-px bg-gray-200"
                  style={{
                    left: `calc(100% / ${children.length * 2} )`,
                    right: `calc(100% / ${children.length * 2} )`,
                  }}
                />
                {children.map((child) => (
                  <div key={child.id} className="flex flex-col items-center flex-1 px-2">
                    {/* Vertical drop to each child */}
                    <div className="w-px h-4 bg-gray-200" />
                    <NodeCard node={child} level={level + 1} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Upline chain renderer ──────────────────────────────────────
function UplineChain({
  upline,
  meNode,
  downlineTree,
}: {
  upline: { id: string; display_name: string | null; email: string }[]
  meNode: TreeNode
  downlineTree: TreeNode[]
}) {
  if (upline.length === 0) {
    // No upline — just render me + downline
    return (
      <div className="flex flex-col items-center">
        <NodeCard node={{ ...meNode, children: downlineTree }} isMe />
      </div>
    )
  }

  // Build a nested component: topmost upline → ... → me → downline
  // We'll render the chain top-to-bottom with connectors
  return (
    <div className="flex flex-col items-center">
      {upline.map((u, i) => (
        <div key={u.id} className="flex flex-col items-center">
          <NodeCard node={{ ...u, children: [] }} isUpline />
          <div className="w-px h-6 bg-amber-200" />
          {i < upline.length - 1 && null /* connector handled by next iteration */}
        </div>
      ))}
      {/* Me with my downline */}
      <NodeCard node={{ ...meNode, children: downlineTree }} isMe />
    </div>
  )
}

// ── Main export ────────────────────────────────────────────────
export default function TeamTree({
  upline,
  me,
  downlineFlat,
}: {
  upline: { id: string; display_name: string | null; email: string }[]
  me: { id: string; display_name: string | null; email: string; referred_by: string | null }
  downlineFlat: FlatNode[]
}) {
  const downlineTree = buildTree(downlineFlat, me.id)

  const meNode: TreeNode = {
    id: me.id,
    display_name: me.display_name,
    email: me.email,
    referred_by: me.referred_by,
    depth: 0,
    created_at: "",
    children: downlineTree,
  }

  const totalTeam = downlineFlat.length
  const directReferrals = downlineFlat.filter((n) => n.referred_by === me.id).length

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Referidos directos</p>
            <p className="text-lg font-bold text-gray-900">{directReferrals}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total en tu red</p>
            <p className="text-lg font-bold text-gray-900">{totalTeam}</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      {upline.length > 0 && (
        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-200 border border-amber-300 inline-block" />
            Tu upline (quien te invitó)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
            Tú
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-white border border-gray-300 inline-block" />
            Tu red
          </span>
        </div>
      )}

      {/* Tree — horizontally scrollable on small screens */}
      <div className="overflow-x-auto pb-6">
        <div className="inline-flex justify-center min-w-full pt-2">
          <UplineChain upline={upline} meNode={meNode} downlineTree={downlineTree} />
        </div>
      </div>
    </div>
  )
}
