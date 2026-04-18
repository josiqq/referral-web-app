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
    router.refresh()
    router.push("/")
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="w-full justify-start gap-1.5 text-muted-foreground"
    >
      <LogOut className="w-4 h-4" />
      <span>Salir</span>
    </Button>
  )
}
