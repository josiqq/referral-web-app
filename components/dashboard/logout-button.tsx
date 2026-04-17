"use client"

import { useRouter } from "@/i18n/routing"
import { createClient } from "@/lib/supabase/client"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="text-gray-500 hover:text-gray-700 gap-1.5"
    >
      <LogOut className="w-4 h-4" />
      <span className="hidden sm:inline">Salir</span>
    </Button>
  )
}
