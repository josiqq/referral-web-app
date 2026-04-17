"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "@/i18n/routing"
import { LogOut } from "lucide-react"

export default function SignOutBtn() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
    >
      <LogOut className="w-4 h-4" />
      <span className="hidden sm:inline">Salir</span>
    </button>
  )
}
